require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config.json');
const jwt = require('jsonwebtoken');

const { authenticateToken } = require('./utilities')

const Customer = require('./models/customer.model');
const Developer = require('./models/developer.model');
const Game = require('./models/game.model');
const Review = require('./models/review.model');
const Payment = require('./models/payment.model');

// Conexión con MongoDB
mongoose.connect(config.connectionString);

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// SignUp developer
app.post('/developers', async (req, res) => {
  try {
    const { companyName, email, password, companyDescription, logoImageUrl } = req.body;

    if (!companyName || !email || !password || !companyDescription, !logoImageUrl) {
      return res
        .status(400)
        .json({ error: true, message: 'All fields are required' });
    }

    const [isCustomer, isDeveloper] = await Promise.all([
      Customer.findOne({ email }),
      Developer.findOne({ email })
    ]);

    if (isCustomer || isDeveloper) {
      return res
        .status(409)
        .json({ error: true, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const developer = new Developer({
      companyName,
      email,
      password: hashedPassword,
      companyDescription,
      logoImageUrl,
      userType: 'developer',
    });

    await developer.save();

    const accessToken = jwt.sign({ userId: developer._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '72h' });

    return res
      .status(201)
      .json({
        error: false,
        user: { companyName: developer.companyName, email: developer.email, companyDescription: developer.companyDescription, logoImageUrl: developer.logoImageUrl, userType: developer.userType },
        accessToken,
        message: 'Developer registered successfully',
      });

  } catch (error) {
    console.error('Error creating developer account:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while creating developer account' });
  }
});

// SignUp customer
app.post('/customers', async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthDate } = req.body;

    if ( !firstName || !lastName || !email || !password || !birthDate ) {
      return res
        .status(400)
        .json({ error: true, message: 'All fields are required' });
  }

  const [isCustomer, isDeveloper] = await Promise.all([
    Customer.findOne({ email }),
    Developer.findOne({ email })
  ]);
  
  if (isCustomer || isDeveloper) {
    return res
      .status(409)
      .json({ error: true, message: 'User already exists'});
  }
 
  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = new Customer({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    birthDate,
    userType: 'customer',
  });

  await customer.save();

  const accessToken = jwt.sign(
    { userId: customer._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '72h',
    }
  );

  return res
    .status(201)
    .json({
    error: false,
    customer: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      password: customer.password,
      birthDate: customer.birthDate,
      userType: customer.userType
    },
    accessToken,
    message: 'Customer registered succesfully',
  });

} catch (error) {
  console.error('Error creating customer account:', error);
  return res
    .status(500)
    .json({ error: true, message: 'An error occurred while creating customer account' });
}
});

app.get('/games/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ error: true, message: 'Search query is required' });
    }

    const searchPattern = new RegExp(q, 'i');

    const games = await Game.find({
      status: 'Publicado',
      $or: [
        { title: searchPattern },
        { category: searchPattern }
      ]
    })
    .select('title category price imageUrl')
    .limit(8);

    if (!games || games.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: 'No games found matching your search' });
    }

    return res
      .status(200)
      .json({ 
        error: false, 
        games,
        message: 'Games found successfully' 
      });

  } catch (error) {
    console.error('Error searching games:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while searching games' });
  }
});

// Login user (developer o customer)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if ( !email || !password ) {
      return res
        .status(400)
        .json({ error: true, message: 'Both email and password fields are required'});
    }

    const [customer, developer] = await Promise.all([
      Customer.findOne({ email }),
      Developer.findOne({ email })
    ]);

    const account = customer || developer;

    if (!account) {
      return res
        .status(401)
        .json({ error: true, message: 'User not found' })
    }

  const isPasswordValid = await bcrypt.compare(password, account.password);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ error: true, message: 'Invalid credentials' })
  }

  const accessToken = jwt.sign(
    { userId: account._id, userType: account.userType },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '72h',
    }
  );

  return res
    .status(200)
    .json({
    error: false,
    user: { 
      email: account.email,
      userType: account.userType,
      developerId: developer ? developer._id : null,
      customerId: customer ? customer._id : null,
      firstName: account.firstName,
      lastName: account.lastName,
      companyName: account.companyName,
    },
    accessToken,
    message: 'User logged in successfully',
  });

} catch (error) {
  console.error('Error during login:', error);
  return res
    .status(500)
    .json({ error: true, message: 'An error occurred during login' });
}
});

// GET users (developer o customer)
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user
    
    const [customer, developer] = await Promise.all([
      Customer.findOne({ _id: userId }),
      Developer.findOne({ _id: userId })
    ]);

    const account = customer || developer;

    if (!account) {
      return res
        .status(401)
        .json({ error: true, message: 'User not found'});
    }

    return res
      .status(200)
      .json({
      user: account,
      message: 'User retrieved successfully',
    });

  } catch (error) {
    console.error('Error retrieving user:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while retrieving the user' });
  }
});

// Crear juego
app.post('/games', authenticateToken, async (req, res) => {
  try {
    const { 
      title,
      description,
      category,
      price,
      os,
      language,
      playersQty,
      minimumRequirements,
      recommendedRequirements,
      status,
      imageUrl
    } = req.body;
    const { userId } = req.user

    if (
      !title ||
      !description ||
      !category ||
      !price ||
      !os ||
      !language ||
      !playersQty ||
      !minimumRequirements ||
      !recommendedRequirements ||
      !status ||
      !imageUrl
    ) {
      return res
        .status(400)
        .json({ error: true, message: 'All fields are required' });
    }

    const game = new Game({
      title,
      description,
      category,
      price,
      os,
      language,
      playersQty,
      minimumRequirements: {
        cpu: minimumRequirements.cpu,
        memory: minimumRequirements.memory,
        gpu: minimumRequirements.gpu
      },
      recommendedRequirements: {
        cpu: recommendedRequirements.cpu,
        memory: recommendedRequirements.memory,
        gpu: recommendedRequirements.gpu
      },
      status,
      developer: userId,
      imageUrl
    })

    await game.save();

    return res
      .status(201)
      .json({ game: game, message: 'Game created successfully' });

  } catch (error) {
    console.error('Error creating game:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while creating game' });
  }
});

//Modificar juego
app.put('/games/:gameId', authenticateToken, async (req, res) => {
  const { gameId } = req.params;
  const { title, description, category, price, os, language, playersQty, minimumRequirements, recommendedRequirements, status, imageUrl } = req.body;

  try {
    const game = await Game.findById(gameId);

    if (!game) {
      return res
        .status(404)
        .json({ error: true, message: 'Game not found' });
    }

    if (title) game.title = title;
    if (description) game.description = description;
    if (category) game.category = category;
    if (price) game.price = price;
    if (os) game.os = os;
    if (language) game.language = language;
    if (playersQty) game.playersQty = playersQty;
    if (minimumRequirements) game.minimumRequirements = minimumRequirements;
    if (recommendedRequirements) game.recommendedRequirements = recommendedRequirements;
    if (status) game.status = status;
    if (imageUrl) game.imageUrl = imageUrl;

    await game.save();

    return res
      .status(200)
      .json({ error: false, message: 'Game updated successfully' });

  } catch (error) {
    console.error('Error updating game:', error);

    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while updating game' });
  }
});

//Eliminar juego
app.delete('/games/:gameId', authenticateToken, async (req, res) => {
  const { gameId } = req.params;

  try {
    const game = await Game.findByIdAndDelete(gameId);

    if (!game) {
      return res
        .status(404)
        .json({ error: true, message: 'Game not found' });
    }

    return res
      .status(200)
      .json({ error: false, message: 'Game deleted successfully' });

  } catch (error) {
    console.error('Error deleting game:', error);
    
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while deleting game' });
  }
});

//Publicar o despublicar juego
app.patch('/games/:gameId/status', authenticateToken, async (req, res) => {
  const { gameId } = req.params;
  const { status } = req.body;

  if (!['Publicado', 'Despublicado'].includes(status)) {
    return res.status(400).json({ error: true, message: 'Invalid status value' });
  }

  try {
    const game = await Game.findById(gameId);

    if (!game) {
      return res
      .status(404)
      .json({ error: true, message: 'Game not found' });
    }

    if (game.status === status) {
      return res
      .status(400)
      .json({ error: true, message: `Game is already ${status.toLowerCase()}` });
    }

    game.status = status;
    await game.save();

    return res
    .status(200)
    .json({ error: false, message: 'Game status updated successfully' });

  } catch (error) {
    console.error('Error updating game status:', error);
    return res
    .status(500)
    .json({ error: true, message: 'An error occurred while updating game status' });
  }
});

// GET todos los juegos de un developer
app.get('/developers/:developerId/games', authenticateToken, async (req, res) => {
  const { developerId } = req.params;

  try {
    const games = await Game.find({ developer: developerId });

    if (!games || games.length === 0 ) {
      return res
        .status(404)
        .json({ error: true, message: 'No games found for this developer' });
    }

    return res
    .status(200)
    .json({ error: false, games, message: 'Games from developer retrieved successfully' });
  }

  catch (error) {
    console.error('Error fetching games:', error);
    return res
    .status(500)
    .json({ error: true, message: 'An error occurred while fetching games' });
  }
});

// GET datos de un juego específico
app.get('/games/:gameId', async (req, res) => {
  const { gameId } = req.params;

  try {
    const game = await Game.findById(gameId)
      .populate('developer', 'companyName companyDescription logoImageUrl')
      .populate('review', 'firstName lastName content rating createdAt');

    if (!game) {
      return res
        .status(404)
        .json({ error: true, message: 'Game not found' });
    }

    const orderedGame = {
      title: game.title,
      description: game.description,
      category: game.category,
      price: game.price,
      os: game.os,
      language: game.language,
      playersQty: game.playersQty,
      minimumRequirements: {
        cpu: game.minimumRequirements.cpu,
        memory: game.minimumRequirements.memory,
        gpu: game.minimumRequirements.gpu
      },
      recommendedRequirements: {
        cpu: game.recommendedRequirements.cpu,
        memory: game.recommendedRequirements.memory,
        gpu: game.recommendedRequirements.gpu
      },
      developer: {
        companyName: game.developer.companyName,
        companyDescription: game.developer.companyDescription,
        logoImageUrl: game.developer.logoImageUrl
      },
      review: {
        firstName: game.review.firstName,
        lastName: game.review.lastName,
        content: game.review.content,
        rating: game.review.rating,
        createdAt: game.review.createdAt
      },
      imageUrl: game.imageUrl
    };

    return res
    .status(200)
    .json({ error: false, game: orderedGame, message: 'Game retrieved successfully' });
  }

  catch (error) {
    console.error('Error fetching games:', error);
    return res
    .status(500)
    .json({ error: true, message: 'An error occurred while fetching game' });
  }
});

// GET juegos con filtros
app.get('/games', async (req, res) => {
  try {
    const { category, price, os, language, playersQty, rating } = req.query;

    const filters = { status: 'Publicado' };

    if (category) filters.category = category;
    if (price) {
      if (price === '40+') {
        filters.price = { $gte: 40 };
      } else {
        const [minPrice, maxPrice] = price.split('-').map(Number);
        filters.price = {};
        if (!isNaN(minPrice)) filters.price.$gte = minPrice;
        if (!isNaN(maxPrice)) filters.price.$lte = maxPrice;
      }
    }
    if (os) filters.os = os;
    if (language) filters.language = language;
    if (playersQty) filters.playersQty = playersQty;
    

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    const orderBy = req.query.orderBy === 'rating' ? 'averageRating' : req.query.orderBy || 'price';
    const order = req.query.order === 'desc' ? -1 : 1;

    const games = await Game.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'game',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' }
        }
      },
      {
        $match: rating ? { averageRating: { $gte: parseFloat(rating) } } : {}
      },
      { $sort: { [orderBy]: order } },
      { $skip: skip },
      { $limit: limit }
    ]);

    if (!games || games.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: 'No games found with these filters' });
    }

    return res
      .status(200)
      .json({ error: false, games, message: 'Games retrieved successfully', page, limit });

  } catch (error) {
    console.error('Error fetching games:', error);
    return res.status(500).json({ error: true, message: 'An error occurred while fetching games' });
  }
});

// Crear review
app.post('/games/:gameId/reviews', authenticateToken, async (req, res) => {
  const { gameId } = req.params;
  const { content, rating } = req.body;
  const { userId } = req.user;

  try {
    const game = await Game.findById(gameId);

    if (!game) {
      return res
        .status(404)
        .json({ error: true, message: 'Game not found' });
    }

    const customer = await Customer.findById(userId);

    if (!customer) {
      return res
        .status(404)
        .json({ error: true, message: 'Customer not found' });
    }

    const review = new Review({
      content,
      rating,
      game: gameId,
      customer: userId,
      firstName: customer.firstName,
      lastName: customer.lastName
    });

    await review.save();

    return res
      .status(201)
      .json({ error: false, review, message: 'Review created successfully' });

  } catch (error) {
    console.error('Error creating review:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while creating review' });
  }
});

// GET reviews de un juego específico
app.get('/games/:gameId/reviews', async (req, res) => {
  const { gameId } = req.params;

  try {
    const reviews = await Review.find({ game: gameId });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: 'No reviews found for this game' });
    }
    return res
      .status(200)
      .json({ error: false, reviews, message: 'Reviews retrieved successfully' });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while fetching reviews' });
  }
});

// Incrementar contador de visitas
app.post('/games/:gameId/views', async (req, res) => {
  const { gameId } = req.params;

  try {
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: true, message: 'Game not found' });
    }

    game.views += 1;
    await game.save();

    return res.status(200).json({ error: false, message: 'View count incremented successfully' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return res.status(500).json({ error: true, message: 'An error occurred while incrementing view count' });
  }
});

//GET stats de todos los juegos de un developer
app.get('/developers/:developerId/games/stats', authenticateToken, async (req, res) => {
  const { developerId } = req.params;

  try {
    const games = await Game.find({ developer: developerId });

    if (!games || games.length === 0 ) {
      return res
        .status(404)
        .json({ error: true, message: 'No games found for this developer' });
    }

    const gameStats = games.map(game => ({
      title: game.title,
      category: game.category,
      price: game.price,
      imageUrl: game.imageUrl,
      views: game.views,
      purchases: game.purchases,
      conversionRate: game.views > 0 ? ((game.purchases / game.views) * 100).toFixed(2) : 0,
      wishlistCount: game.wishlistCount
    }));

    return res
      .status(200)
      .json({ error: false, games: gameStats, message: 'Games stats from developer retrieved successfully' });
  } catch (error) {
    console.error('Error fetching games stats:', error);

    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while fetching games stats' });
  }
});

//Agregar juego a wishlist
app.post('/customers/:customerId/wishlist', authenticateToken, async (req, res) => {
  const { customerId } = req.params;
  const { gameId } = req.body;

  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res
        .status(404)
        .json({ error: true, message: 'Customer not found' });
    }

    if (customer.wishlist.includes(gameId)) {
      return res
        .status(400)
        .json({ error: true, message: 'Game already in wishlist' });
    }

    customer.wishlist.push(gameId);
    await customer.save();

    const game = await Game.findById(gameId);
    if (game) {
      game.wishlistCount += 1;
      await game.save();
    }

    return res
      .status(200)
      .json({ error: false, message: 'Game added to wishlist successfully' });

  } catch (error) {
    console.error('Error adding game to wishlist:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while adding game to wishlist' });
  }
});

//Eliminar juego de wishlist
app.delete('/customers/:customerId/wishlist/:gameId', authenticateToken, async (req, res) => {
  const { customerId, gameId } = req.params;

  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res
        .status(404)
        .json({ error: true, message: 'Customer not found' });
    }

    const gameIndex = customer.wishlist.indexOf(gameId);
    if (gameIndex === -1) {
      return res
        .status(404)
        .json({ error: true, message: 'Game not found in wishlist' });
    }

    customer.wishlist.splice(gameIndex, 1);
    await customer.save();

    const game = await Game.findById(gameId);
    if (game) {
      game.wishlistCount = Math.max(game.wishlistCount - 1, 0);
      await game.save();
    }

    return res
      .status(200)
      .json({ error: false, message: 'Game removed from wishlist successfully' });

  } catch (error) {
    console.error('Error removing game from wishlist:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while removing game from wishlist' });
  }
});

//GET juegos en wishlist de un customer
app.get('/customers/:customerId/wishlist', authenticateToken, async (req, res) => {
  const { customerId } = req.params;

  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res
        .status(404)
        .json({ error: true, message: 'Customer not found' });
    }

    const games = await Game.find({ _id: { $in: customer.wishlist } }).select('title category price imageUrl');

    if (!games || games.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: 'No games found in wishlist' });
    }

    return res
      .status(200)
      .json({ error: false, games, message: 'Games in wishlist retrieved successfully' });

  } catch (error) {
    console.error('Error fetching wishlist games:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while fetching wishlist games' });
  }
});

//Comprar juego
app.post('/customers/:customerId/games/purchases', authenticateToken, async (req, res) => {
  const { customerId } = req.params;
  const { gameId, cardNumber, cardProvider, cardExpDate, cardCVC } = req.body;

  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res
        .status(404)
        .json({ error: true, message: 'Customer not found' });
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res
        .status(404)
        .json({ error: true, message: 'Game not found' });
    }

    if (!cardNumber || !cardProvider || !cardExpDate || !cardCVC) {
      return res
        .status(400)
        .json({ error: true, message: 'Invalid payment details' });
    }

    const payment = new Payment({ 
      cardNumber, 
      cardProvider, 
      cardExpDate, 
      cardCVC, 
      gameId, 
      customerId 
    });

    await payment.save();

    game.purchases += 1;
    await game.save();

    return res
      .status(200)
      .json({ error: false, message: 'Game purchased successfully' });

  } catch (error) {
    console.error('Error purchasing game:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while purchasing game' });
  }
});

//GET juegos comprados de un customer
app.get('/customers/:customerId/games/purchases', authenticateToken, async (req, res) => {
  const { customerId } = req.params;

  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res
        .status(404)
        .json({ error: true, message: 'Customer not found' });
    }

    const purchases = await Payment.find({ customerId }).populate('gameId', 'title category price imageUrl');

    if (!purchases || purchases.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: 'No purchases found' });
    }

    return res
      .status(200)
      .json({ error: false, purchases, message: 'Purchases retrieved successfully' });

  } catch (error) {
    console.error('Error fetching purchases:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while fetching purchases' });
  }
});

//Request de reset de password
app.post('/users/password-reset-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: true, message: 'Email is required' });
    }

    const user = await Customer.findOne({ email }) || await Developer.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: 'User not found' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiration = Date.now() + 3600000; // 1 hora a partir de ahora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiration;
    await user.save();

    return res
      .status(200)
      .json({ 
        error: false, 
        message: 'Password reset token generated successfully', 
        resetToken,
        resetTokenExpiration 
      });
  } catch (error) {
    console.error('Error generating password reset token:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while generating password reset token' });
  }
});

//Reset de password
app.post('/users/password-reset', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ error: true, message: 'Reset token and new password are required' });
    }

    const user = await Customer.findOne({ 
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    }) || await Developer.findOne({ 
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: true, message: 'Password reset token is invalid or has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ error: false, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res
      .status(500)
      .json({ error: true, message: 'An error occurred while resetting password' });
  }
});

// Middleware para handling de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: true,
    status: statusCode,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler para rutas no definidas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    status: 404,
    message: 'Not Found',
  });
});

// Configuración del puerto y levantar el server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});