const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
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
      const blob = bucket.file(`profiles/${email}/picture.png`);
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


app.post('/v1/products', upload.array('files', 5), async (req, res) => {
  const {
    name, brand, colour, description, material, price, stockStatus, model3d, sizes
  } = req.body;
  const files = req.files;

  try {
    const docRef = await db.collection('products').doc();
    const productId = docRef.id;
    const imageUrls = [];
    let model3dUrl = "";

    if (files) {
      for (const file of files) {
        const isModel3D = file.mimetype === 'model/gltf-binary' || file.originalname.endsWith('.glb');
        const directory = isModel3D ? `3dmodel/${productId}` : `products/${productId}/images`;
        const blob = bucket.file(`${directory}/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        await new Promise((resolve, reject) => {
          blobStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            reject(error);
          });

          blobStream.on('finish', async () => {
            await blob.makePublic();
            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            if (isModel3D) {
              model3dUrl = fileUrl;
            } else {
              imageUrls.push(fileUrl);
            }
            resolve();
          });

          blobStream.end(file.buffer);
        });
      }
    }

    const product = {
      name,
      brand,
      colour,
      description,
      material,
      price: parseFloat(price),
      stockStatus: stockStatus === 'true' || stockStatus === true,
      type: 'Shoes',
      images: imageUrls,
      model3d: model3d === 'true' || model3d === true,
      model3dUrl: model3dUrl || null,  
      sizes: JSON.parse(sizes),
      totalOrdered: 0,
    };

    await docRef.set(product);

    res.status(201).json({ message: 'Product added successfully', id: productId, product });
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

app.delete('/v1/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const productRef = db.collection('products').doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = doc.data();
    const imageUrls = product.images || [];

    const deletePromises = imageUrls.map(async (url) => {
      try {
        const filePath = decodeURIComponent(url.split('/').slice(4).join('/'));
        const file = bucket.file(filePath);
        await file.delete();
      } catch (error) {
        console.error('Error deleting file from storage:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    });

    await Promise.all(deletePromises);
    await productRef.delete();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/v1/products/:id', upload.array('images', 4), async (req, res) => {
  const { id } = req.params;
  const {
    name, price, description, amount, colour, material, brand, size, stockStatus
  } = req.body;
  const files = req.files;

  try {
    const productRef = db.collection('products').doc(id);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = doc.data();
    let imageUrls = product.images || [];

    if (files && files.length > 0) {
      const deletePromises = imageUrls.map(async (url) => {
        try {
          const filePath = decodeURIComponent(url.split('/').slice(4).join('/'));
          const file = bucket.file(filePath);
          await file.delete();
        } catch (error) {
          console.error('Error deleting file from storage:', error);
        }
      });
      await Promise.all(deletePromises);

      imageUrls = [];
      for (const file of files) {
        const blob = bucket.file(`products/${id}/images/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        await new Promise((resolve, reject) => {
          blobStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            reject(error);
          });

          blobStream.on('finish', async () => {
            await blob.makePublic();
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            imageUrls.push(imageUrl);
            resolve();
          });

          blobStream.end(file.buffer);
        });
      }
    }

    const updatedProduct = {
      name,
      price: parseFloat(price),
      description,
      amount: parseInt(amount, 10),
      colour,
      material,
      brand,
      images: imageUrls,
      size: parseInt(size, 10),
      stockStatus: stockStatus === 'true', // Convert to boolean
      type: 'shoes', // Always set type to 'shoes'
      totalOrdered: product.totalOrdered || 0 // Keep the existing totalOrdered value
    };

    await productRef.update(updatedProduct);

    res.status(200).json({ message: 'Product updated successfully', id, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/v1/products', async (req, res) => {
  const { type, offset = 0, limit = 10 } = req.query;
  try {
    let query = db.collection('products');
    if (type) {
      query = query.where('type', '==', type);
    }
    const snapshot = await query.get();
    const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const products = allProducts.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    res.status(200).json(products);
  } catch (error) {
    console.error('Error listing products:', error);
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

app.get('/v1/search', async (req, res) => {
  const { query, type } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    let productsRef = db.collection('products').where('name', '>=', query).where('name', '<=', query + '\uf8ff');

    if (type) {
      productsRef = productsRef.where('type', '==', type);
    }

    const snapshot = await productsRef.get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No matching products found' });
    }

    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/upload-feet', upload.single('feetImage'), async (req, res) => {
  const { email, foot } = req.body; 
  const file = req.file;

  if (!email || !file || !foot) {
    return res.status(400).json({ message: 'Email, foot (left or right), and feet image are required' });
  }

  try {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fileName = `${foot}_${Date.now()}_${file.originalname}`;
    const localFilePath = path.join('/Users/apple/workspace/ARFootwear/backend/FeetMeasurement/data', fileName);

    fs.writeFile(localFilePath, file.buffer, async (err) => {
      if (err) {
        console.error('Error saving file locally:', err);
        return res.status(500).json({ message: 'Error saving file locally' });
      }

      console.log('File saved locally:', localFilePath);

      fs.access(localFilePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error('File does not exist:', localFilePath);
          return res.status(500).json({ message: 'File does not exist' });
        }

        const pythonPath = 'python3'; 
        const scriptPath = path.join('/Users/apple/workspace/ARFootwear/backend/FeetMeasurement', 'main.py');

        exec(`${pythonPath} ${scriptPath} ${localFilePath}`, async (error, stdout, stderr) => {
          if (error) {
            console.error('Error executing Python script:', error);
            return res.status(500).json({ message: 'Error processing feet image' });
          }

          console.log('Python script output:', stdout.trim());

          const resultLines = stdout.trim().split('\n');
          const feetSizeLine = resultLines.find(line => line.includes('feet size (cm):'));
          const feetSize = feetSizeLine ? feetSizeLine.split(':')[1].trim() : 'Unknown';

          try {
            if (foot === 'left') {
              await userRef.update({ leftFeet: feetSize });
            } else if (foot === 'right') {
              await userRef.update({ rightFeet: feetSize });
            }

            res.status(200).json({ message: 'Feet image uploaded and processed successfully', feetSize });
          } catch (updateError) {
            console.error('Error updating Firestore:', updateError);
            res.status(500).json({ message: 'Error updating user data in Firestore' });
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in /upload-feet:', error);
    res.status(500).json({ message: error.message });
  }
});