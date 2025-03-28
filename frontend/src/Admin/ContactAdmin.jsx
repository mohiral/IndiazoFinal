import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaPhone, 
  FaWhatsapp, 
  FaEnvelope, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaCheck, 
  FaTimes,
  FaSpinner,
  FaToggleOn,
  FaToggleOff
} from "react-icons/fa";

const ContactAdmin = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "phone",
    value: "",
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://backend.indiazo.com/api/contacts');
      setContacts(response.data.contacts);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      showNotification("Failed to load contacts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('https://backend.indiazo.com/api/contacts', formData);
      showNotification("Contact added successfully", "success");
      setFormData({
        type: "phone",
        value: "",
        isActive: true
      });
      setShowForm(false);
      fetchContacts();
    } catch (error) {
      console.error("Failed to add contact:", error);
      showNotification("Failed to add contact", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      await axios.delete(`https://backend.indiazo.com/api/contacts/${id}`);
      showNotification("Contact deleted successfully", "success");
      fetchContacts();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      showNotification("Failed to delete contact", "error");
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'phone':
        return <FaPhone className="text-blue-600" />;
      case 'whatsapp':
        return <FaWhatsapp className="text-green-600" />;
      case 'email':
        return <FaEnvelope className="text-purple-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'phone':
        return 'bg-blue-100 text-blue-600';
      case 'whatsapp':
        return 'bg-green-100 text-green-600';
      case 'email':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center transition-all duration-300 opacity-100`}>
          {notification.type === 'success' ? (
            <FaCheck className="mr-2" />
          ) : (
            <FaTimes className="mr-2" />
          )}
          {notification.message}
        </div>
      )}

      <div className=" mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-4">
          <h1 className="text-xl font-bold text-white">Contact Management</h1>
          <p className="text-blue-100 text-sm mt-1">Manage your contact information</p>
        </div>
        
        <div className="p-4">
          <button 
            className={`flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              showForm 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg'
            }`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <FaTimes className="mr-2" /> Cancel
              </>
            ) : (
              <>
                <FaPlus className="mr-2" /> Add New Contact
              </>
            )}
          </button>
          
          {showForm && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaPlus className="mr-2 text-blue-500" /> Add New Contact
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type:</label>
                  <div className="relative">
                    <select 
                      name="type" 
                      value={formData.type} 
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="phone">Phone</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {getTypeIcon(formData.type)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Value:</label>
                  <input 
                    type="text" 
                    name="value" 
                    value={formData.value} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={formData.type === 'phone' ? '+91 9876543210' : formData.type === 'whatsapp' ? '9876543210' : 'example@email.com'}
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={formData.isActive} 
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="ml-3 text-gray-700">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" /> Add Contact
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FaSpinner className="animate-spin text-blue-500 text-3xl mb-3" />
                <p className="text-gray-500">Loading contacts...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-500 mb-3">
                  <FaPhone className="text-xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No contacts found</h3>
                <p className="text-gray-500 mb-4 text-sm">Add your first contact to get started</p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaPlus className="mr-2" /> Add Contact
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div 
                    key={contact._id} 
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getTypeColor(contact.type)} flex items-center justify-center`}>
                          {getTypeIcon(contact.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 capitalize">{contact.type}</div>
                          <div className="text-sm text-gray-600">{contact.value}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {contact.isActive ? (
                            <FaToggleOn className="text-green-500 text-xl" />
                          ) : (
                            <FaToggleOff className="text-gray-400 text-xl" />
                          )}
                          <span className="ml-1 text-xs text-gray-500">
                            {contact.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDelete(contact._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Delete contact"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;
