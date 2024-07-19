const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { admin, db, bucket } = require('./firebase/firebase');

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { Product } = require('./model/products');


app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const roles = 'user'; 

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (doc.exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userRef.set({
      name,
      email,
      password: hashedPassword,
      roles,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = doc.data();
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email, name: user.name, roles: user.roles }, 'secretKey', { expiresIn: '1h' });

    res.status(200).json({ access_token: token, roles: user.roles });
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/users/:email', async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error in /users/:email:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/update-profile', upload.single('profileImage'), async (req, res) => {
  const { email, contactNumber, address, name } = req.body;
  const file = req.file;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileImageUrl = doc.data().profileImage;
    if (file) {
      const blob = bucket.file(`profiles/${Date.now()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });

      blobStream.on('error', (error) => {
        console.error('Error uploading file:', error);
        return res.status(500).json({ message: error.message });
      });

      blobStream.on('finish', async () => {
        // Make the file publicly readable
        await blob.makePublic();
        profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log('Uploaded image URL:', profileImageUrl); 
        await userRef.update({
          name,
          contactNumber,
          profileImage: profileImageUrl,
          address
        });

        res.status(200).json({ message: 'Profile updated successfully', profileImage: profileImageUrl });
      });

      blobStream.end(file.buffer);
    } else {
      await userRef.update({
        name,
        contactNumber,
        address
      });

      res.status(200).json({ message: 'Profile updated successfully' });
    }
  } catch (error) {
    console.error('Error in /update-profile:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/v1/products', upload.single('image'), async (req, res) => {
  const {
    name, price, description, amount, type, colour, material, brand, size, totalOrdered, stockStatus
  } = req.body;
  const file = req.file;

  try {
    let imageUrl = '';
    if (file) {
      const blob = bucket.file(`products/${Date.now()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });

      blobStream.on('error', (error) => {
        console.error('Error uploading file:', error);
        return res.status(500).json({ message: error.message });
      });

      blobStream.on('finish', async () => {
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        const product = {
          name,
          price: parseFloat(price),
          description,
          amount: parseInt(amount, 10),
          type,
          colour,
          material,
          brand,
          image: imageUrl,
          size: parseInt(size, 10),
          totalOrdered: parseInt(totalOrdered, 10),
          stockStatus
        };

        const docRef = await db.collection('products').add(product);
        res.status(201).json({ message: 'Product added successfully', id: docRef.id, product });
      });

      blobStream.end(file.buffer);
    } else {
      const product = {
        name,
        price: parseFloat(price),
        description,
        amount: parseInt(amount, 10),
        type,
        colour,
        material,
        brand,
        image: imageUrl,
        size: parseInt(size, 10),
        totalOrdered: parseInt(totalOrdered, 10),
        stockStatus
      };

      const docRef = await db.collection('products').add(product);
      res.status(201).json({ message: 'Product added successfully', id: docRef.id, product });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/v1/products', async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  try {
    const snapshot = await db.collection('products').get();
    const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const products = allProducts.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    res.status(200).json(products);
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/v1/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = {
      id: doc.id,
      ...doc.data(),
      stockStatus: doc.data().stockStatus 
    };
    res.status(200).json(product);
  } catch (error) {
    console.error('Error getting product details:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/v1/categories/:categoryId/products', async (req, res) => {
  const { categoryId } = req.params;
  const { offset = 0, limit = 10 } = req.query;
  try {
    const snapshot = await db.collection('products')
      .where('type', '==', categoryId) // Assuming 'type' is the category
      .offset(parseInt(offset))
      .limit(parseInt(limit))
      .get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(products);
  } catch (error) {
    console.error('Error getting products by category:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/v1/auth/refresh-token', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    jwt.verify(token, 'secretKey', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      const newToken = jwt.sign({ email: user.email, name: user.name }, 'secretKey', { expiresIn: '1h' });

      res.status(200).json({ access_token: newToken });
    });
  } catch (error) {
    console.error('Error in /v1/auth/refresh-token:', error);
    res.status(500).json({ message: error.message });
  }
});
