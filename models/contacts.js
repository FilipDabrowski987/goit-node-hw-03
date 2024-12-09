const fs = require('fs/promises')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const contactsPath = path.join(__dirname, 'contacts.json')

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath)
    return JSON.parse(data)
  } catch (error) {
    throw new Error('Nie udało się pobrać kontaktów')
  }
}

const getContactById = async (contactId) => {
    const data = await fs.readFile(contactsPath)
    const contacts = JSON.parse(data)

    const contact = contacts.find(contact => contact.id === contactId)

    if (!contact) {
      throw new Error('Nie znaleziono kontaktu')
    }

    return contact
}

const removeContact = async (contactId) => {
  const data = await fs.readFile(contactsPath)
  const contacts = JSON.parse(data)

  const filteredContacts = contacts.filter(contact => contact.id !== contactId)
  
  if (contacts.length === filteredContacts.length) {
    throw new Error('Nie znaleziono kontaktu')
  }

  await fs.writeFile(contactsPath, JSON.stringify(filteredContacts, null, 2))

  const removedContact = contacts.find(contact => contact.id === contactId)
  return removedContact
    
}

const addContact = async (body) => {
  const {
    name,
    email,
    phone } = body

  const data = await fs.readFile(contactsPath)
  const contacts = JSON.parse(data);

  const newContact = { id: uuidv4(), name, email, phone }
  contacts.push(newContact);

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2))
  
  return newContact  
}

const updateContact = async (contactId, body) => {
  const data = await fs.readFile(contactsPath)
  const contacts = JSON.parse(data)

  const contactIndex = contacts.findIndex(contact => contact.id === contactId)

  if (contactIndex === -1) {
    throw new Error('Kontak nie istnieje')
  }

  const updatedContact = { ...contacts[contactIndex], ...body }
  contacts[contactIndex] = updatedContact

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2))

  return updatedContact
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}