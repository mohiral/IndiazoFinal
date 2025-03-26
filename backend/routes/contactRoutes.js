const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ type: 1 });
    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

// Get active contacts only
router.get('/active', async (req, res) => {
  try {
    const contacts = await Contact.find({ isActive: true }).sort({ type: 1 });
    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Error fetching active contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active contacts' });
  }
});

// Get a single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, contact });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact' });
  }
});

// Create a new contact
router.post('/', async (req, res) => {
  try {
    const { type, value, isActive } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'Type and value are required' });
    }
    
    const newContact = new Contact({
      type,
      value,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await newContact.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Contact added successfully',
      contact: newContact
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, message: 'Failed to create contact' });
  }
});

// Update a contact
router.put('/:id', async (req, res) => {
  try {
    const { type, value, isActive } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'Type and value are required' });
    }
    
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { type, value, isActive },
      { new: true, runValidators: true }
    );
    
    if (!updatedContact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({
      success: true,
      message: 'Contact updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
});

// Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!deletedContact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
});

module.exports = router;