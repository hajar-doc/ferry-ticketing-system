const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const stops = [];
const tickets = [];
let stopId = 1;
let ticketId = 1

// Add Stop
app.post('/stops', (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const stop = { id: String(stopId++), name };
    stops.push(stop);
    res.status(201).json(stop);
  } catch (err) {
    next(err);
  }
});

// Buy Ticket
app.post('/tickets', (req, res, next) => {
  try {
    const { startStop, endStop, price } = req.body;
    if (!startStop || !endStop || !price) {
      return res.status(400).json({ error: 'StartStop, EndStop, and Price are required' });
    }
    if (!stops.find(stop => stop.id === startStop) || !stops.find(stop => stop.id === endStop)) {
      return res.status(400).json({ error: 'Invalid stop IDs' });
    }
    const ticket = { id: String(ticketId++), startStop, endStop, price };
    tickets.push(ticket);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
});

// Get Ticket Info
app.get('/tickets/:id', (req, res, next) => {
  try {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

// List Tickets
app.get('/tickets', (req, res, next) => {
  try {
    const { startStop, endStop } = req.query;
    let filteredTickets = tickets;

    if (startStop) {
      filteredTickets = filteredTickets.filter(t => t.startStop === startStop);
    }
    if (endStop) {
      filteredTickets = filteredTickets.filter(t => t.endStop === endStop);
    }

    // Ensure the response is always a valid JSON array
    res.json(filteredTickets || []);
  } catch (err) {
    next(err);
  }
});

// Cancel Ticket
app.delete('/tickets/:id', (req, res, next) => {
  try {
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    tickets.splice(ticketIndex, 1);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Error Handling Middleware
const errorHandlingMiddleware = (err, req, res, next) => {
  console.error(err.stack);  // Log the error stack trace
  res.status(500).json({ error: 'An unexpected error occurred.' });
};

// Apply Error Handling Middleware
app.use(errorHandlingMiddleware);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
