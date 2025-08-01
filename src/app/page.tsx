'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface UPIFormData {
  payeeVPA: string;
  payeeName: string;
  amount: string;
  currency: string;
  transactionNote: string;
  merchantCode: string;
  minimumAmount: string;
  maximumAmount: string;
  transactionRef: string;
  merchantCategoryCode: string;
  merchantCity: string;
  merchantPinCode: string;
}

export default function Home() {
  const [formData, setFormData] = useState<UPIFormData>({
    payeeVPA: '',
    payeeName: '',
    amount: '',
    currency: 'INR',
    transactionNote: '',
    merchantCode: '',
    minimumAmount: '',
    maximumAmount: '',
    transactionRef: '',
    merchantCategoryCode: '',
    merchantCity: '',
    merchantPinCode: '',
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [generatedUri, setGeneratedUri] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format amount fields to always have .00 decimal when user finishes typing
    if (['amount', 'minimumAmount', 'maximumAmount'].includes(name) && value) {
      let formattedValue = value;

      // Remove any existing decimal formatting first
      const cleanValue = value.replace(/\.00$|\.0$/, '');

      if (!cleanValue.includes('.')) {
        formattedValue = cleanValue + '.00';
      } else {
        const parts = cleanValue.split('.');
        if (parts[1].length === 1) {
          formattedValue = cleanValue + '0';
        } else if (parts[1].length === 0) {
          formattedValue = cleanValue + '00';
        } else {
          formattedValue = cleanValue;
        }
      }

      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
  };

  const generateUPIQRCode = async () => {
    if (!formData.payeeVPA) {
      setError('Payee VPA is required');
      return;
    }

    setIsGenerating(true);
    setError('');

        try {
      // Build UPI URL according to UPI specification
      let upiUrl = `upi://pay?pa=${encodeURIComponent(formData.payeeVPA)}`;

      if (formData.payeeName) {
        upiUrl += `&pn=${encodeURIComponent(formData.payeeName)}`;
      }

      if (formData.amount) {
        upiUrl += `&am=${encodeURIComponent(formData.amount)}`;
      }

      if (formData.currency) {
        upiUrl += `&cu=${encodeURIComponent(formData.currency)}`;
      }

      if (formData.transactionNote) {
        upiUrl += `&tn=${encodeURIComponent(formData.transactionNote)}`;
      }

      if (formData.merchantCode) {
        upiUrl += `&mc=${encodeURIComponent(formData.merchantCode)}`;
      }

      if (formData.minimumAmount) {
        upiUrl += `&mam=${encodeURIComponent(formData.minimumAmount)}`;
      }

      if (formData.maximumAmount) {
        upiUrl += `&mxam=${encodeURIComponent(formData.maximumAmount)}`;
      }

      if (formData.transactionRef) {
        upiUrl += `&tr=${encodeURIComponent(formData.transactionRef)}`;
      }

      if (formData.merchantCategoryCode) {
        upiUrl += `&mcc=${encodeURIComponent(formData.merchantCategoryCode)}`;
      }

      if (formData.merchantCity) {
        upiUrl += `&mcity=${encodeURIComponent(formData.merchantCity)}`;
      }

      if (formData.merchantPinCode) {
        upiUrl += `&mpin=${encodeURIComponent(formData.merchantPinCode)}`;
      }

      // Store the generated URI
      setGeneratedUri(upiUrl);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataUrl(qrDataUrl);
    } catch (err) {
      setError('Failed to generate QR code. Please try again.');
      console.error('QR Code generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = 'upi-qr-code.png';
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  const shareQRCode = async () => {
    setShowShareMenu(true);
  };

  const shareViaNative = async () => {
    setShowShareMenu(false);
    try {
      // Check if Web Share API is available and supports files
      if (navigator.share && navigator.canShare) {
        // Try to share with file first (QR code image)
        const response = await fetch(qrCodeDataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'upi-qr-code.png', { type: 'image/png' });

        const shareData = {
          title: 'UPI QR Code',
          text: 'Generated UPI QR Code for payment',
          files: [file]
        };

        // Check if the browser can share files
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // If file sharing is not supported, fallback to download
      alert('Native sharing not supported. Please use "Download QR Image" to save the QR code.');
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share QR code. Please use "Download QR Image" to save the QR code.');
    }
  };

  const shareQRImage = async () => {
    setShowShareMenu(false);
    try {
      // Create a temporary link to download the QR image
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = 'upi-qr-code.png';
      link.click();

      // Show a message to guide the user
      alert('QR code image downloaded! You can now share the downloaded image file.');
    } catch (error) {
      console.error('Error sharing QR image:', error);
      alert('Failed to download QR code image. Please try again.');
    }
  };



  // Close share menu when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.share-menu-container')) {
      setShowShareMenu(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (showShareMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showShareMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">UPI QR Code Generator</h1>
          <p className="text-gray-600">Generate UPI QR codes with all available parameters</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">UPI Parameters</h2>

            <div className="space-y-4">
              {/* Essential Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payee VPA (UPI ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="payeeVPA"
                  value={formData.payeeVPA}
                  onChange={handleInputChange}
                  placeholder="example@upi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  onBlur={handleAmountBlur}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Advanced Options Accordion */}
              <div className="border border-gray-200 rounded-md">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">Advanced Options</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAdvancedOptions && (
                  <div className="p-4 space-y-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payee Name
                      </label>
                      <input
                        type="text"
                        name="payeeName"
                        value={formData.payeeName}
                        onChange={handleInputChange}
                        placeholder="Recipient Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="INR">INR (Indian Rupee)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Note
                      </label>
                      <input
                        type="text"
                        name="transactionNote"
                        value={formData.transactionNote}
                        onChange={handleInputChange}
                        placeholder="Payment for services"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Merchant Code
                      </label>
                      <input
                        type="text"
                        name="merchantCode"
                        value={formData.merchantCode}
                        onChange={handleInputChange}
                        placeholder="Merchant identifier"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Amount
                        </label>
                        <input
                          type="number"
                          name="minimumAmount"
                          value={formData.minimumAmount}
                          onChange={handleInputChange}
                          onBlur={handleAmountBlur}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Amount
                        </label>
                        <input
                          type="number"
                          name="maximumAmount"
                          value={formData.maximumAmount}
                          onChange={handleInputChange}
                          onBlur={handleAmountBlur}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Reference
                      </label>
                      <input
                        type="text"
                        name="transactionRef"
                        value={formData.transactionRef}
                        onChange={handleInputChange}
                        placeholder="Unique transaction ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Merchant Category Code (MCC)
                      </label>
                      <input
                        type="text"
                        name="merchantCategoryCode"
                        value={formData.merchantCategoryCode}
                        onChange={handleInputChange}
                        placeholder="e.g., 5411 for grocery stores"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Merchant City
                        </label>
                        <input
                          type="text"
                          name="merchantCity"
                          value={formData.merchantCity}
                          onChange={handleInputChange}
                          placeholder="City name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Merchant PIN Code
                        </label>
                        <input
                          type="text"
                          name="merchantPinCode"
                          value={formData.merchantPinCode}
                          onChange={handleInputChange}
                          placeholder="PIN code"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>

                    {/* QR Code Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generated QR Code</h2>

            <button
              onClick={generateUPIQRCode}
              disabled={isGenerating || !formData.payeeVPA}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
            >
              {isGenerating ? 'Generating QR Code...' : 'Generate QR Code'}
            </button>

            {qrCodeDataUrl ? (
              <div className="text-center">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <img
                    src={qrCodeDataUrl}
                    alt="UPI QR Code"
                    className="mx-auto max-w-full h-auto"
                  />
                </div>

                {/* Generated URI Display */}
                <div className="mb-4 text-left">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Generated UPI URI:</h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <code className="text-xs text-gray-800 break-all">{generatedUri}</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={downloadQRCode}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    Download QR Code
                  </button>

                  <div className="relative share-menu-container">
                    <button
                      onClick={shareQRCode}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share QR Code
                    </button>

                                         {/* Share Menu */}
                     {showShareMenu && (
                       <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                         <div className="p-2 space-y-1">
                           <button
                             onClick={shareQRImage}
                             className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                             Download QR Image
                           </button>
                           <button
                             onClick={shareViaNative}
                             className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                             </svg>
                             Share QR Image (Mobile)
                           </button>
                         </div>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-gray-600">Fill the form and generate your UPI QR code</p>
              </div>
            )}
          </div>
        </div>

                 {/* Information Section */}
         <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
           <h3 className="text-xl font-semibold text-gray-800 mb-4">About UPI QR Codes</h3>
           <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
             <div>
               <h4 className="font-medium text-gray-800 mb-2">Required Fields:</h4>
               <ul className="space-y-1">
                 <li>• <strong>Payee VPA:</strong> UPI ID of the recipient (e.g., example@upi)</li>
               </ul>
             </div>
             <div>
               <h4 className="font-medium text-gray-800 mb-2">Optional Fields:</h4>
               <ul className="space-y-1">
                 <li>• <strong>Payee Name:</strong> Name of the recipient</li>
                 <li>• <strong>Amount:</strong> Fixed amount for the transaction</li>
                 <li>• <strong>Transaction Note:</strong> Description of the payment</li>
                 <li>• <strong>Merchant Details:</strong> For business transactions</li>
               </ul>
             </div>
           </div>
         </div>

         {/* Footer */}
         <div className="mt-8 text-center">
           <a
             href="https://hsps.in"
             target="_blank"
             rel="noopener noreferrer"
             className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
           >
             Built by Harisankar PS | hsps.in
           </a>
         </div>
       </div>
     </div>
   );
 }
