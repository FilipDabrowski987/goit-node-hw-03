const express = require('express')
const Joi = require('joi')
const { listContacts, getContactById, addContact, removeContact, updateContact } = require('../../models/contacts')

const router = express.Router()

const schema = Joi.object({

  name:
    Joi.string()
    .min(3)
    .max(30)
    .required(),
  
  email:
    Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'uk' ] } })
      .required(),
  
  phone:
    Joi.string()
      .pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
      .required(),
})

const validateContact = (req, res, next) => {
  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  next()
}

router.get('/', async (req, res, next) => {
  try {
    const contacts = await listContacts()
    res.status(200).json({
      contacts,
      message: 'Pobrano kontakty'
    })
  } catch (error) {
    next(error)
  }
}) 

router.get('/:contactId', async (req, res, next) => {
  try {
    const contactById = await getContactById(req.params.contactId)
    res.status(200).json({
      contactById,
      message: 'Znaleziono Kontakt'
    })
  } catch (error) {
    if (error.message === 'Nie znaleziono kontaktu') {
      res.status(404).json({ message: 'Nie znaleziono kontaktu' })
    } else {
      next(error)
    }
  }  
})

router.post('/', validateContact, async (req, res, next) => {
  try {
    const newContact = await addContact(req.body)

    res.status(201).json({
      id: newContact.id,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      message: 'Utworzono nowy kontakt'
    })
  } catch (error) {
    next(error);
  }  
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params
    await removeContact(contactId)
    res.status(200).json({ message: 'Kontakt usunięty' })
  } catch (error) {
    if (error.message === 'Nie znaleziono kontaktu') {
      res.status(404).json({ message: 'Nie znaleziono kontaktu' })
    } else {
      next(error)
    }
  }
})

router.put('/:contactId', validateContact, async (req, res, next) => {
  try {
    const { contactId } = req.params
    const body = req.body

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ message: 'Brak wprowadzonych zmian' })
    }
    
    const updatedContact = await updateContact(contactId, body)
   
    res.status(200).json({
      updatedContact,
      message: 'Kontakt został zaktualizowany',
    });
  } catch (error) {
    if (error.message === 'Nie znaleziono kontaktu') {
      res.status(404).json({ message: 'Nie znaleziono kontaktu' })
    } else {
      next(error)
    }
  }
})

module.exports = router