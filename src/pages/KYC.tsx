import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, FileText, Camera, Shield, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';

export function KYCPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    address: '',
    documentType: 'passport',
    documentFront: null as File | null,
    documentBack: null as File | null,
    faceSelfie: null as File | null,
    agreedToTerms: false
  });

  const [uploadProgress, setUploadProgress] = useState({
    documentFront: 0,
    documentBack: 0,
    faceSelfie: 0
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (name: string, file: File | null) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(prev => ({
          ...prev,
          [name]: progress
        }));
      }, 300);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.firstName && formData.lastName && formData.dateOfBirth && formData.country;
    }
    if (step === 2) {
      return formData.address && formData.city && formData.state && formData.zipCode;
    }
    if (step === 3) {
      return formData.documentFront && formData.documentBack;
    }
    if (step === 4) {
      return formData.faceSelfie;
    }
    return true;
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const { user, submitKYC } = useStore();

  const handleSubmit = () => {
    if (formData.agreedToTerms && user) {
      submitKYC(user.id, formData);
      setStep(6);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Address', icon: '🏠' },
    { number: 3, title: 'ID Document', icon: '📄' },
    { number: 4, title: 'Selfie', icon: '📸' },
    { number: 5, title: 'Review', icon: '✓' }
  ];

  // if user status changes we can adjust current step
  useEffect(() => {
    if (user?.kycStatus === 'APPROVED') {
      setStep(7); // approved status page
    }
    if (user?.kycStatus === 'PENDING') {
      setStep(6); // pending status page
    }
    if (user?.kycStatus === 'REJECTED') {
      setStep(1); // allow resubmission from step 1
    }
  }, [user?.kycStatus]);

  const isDisabled = user?.kycStatus === 'PENDING' || user?.kycStatus === 'APPROVED';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 pb-20 md:pb-6">
      {/* Conditional rendering based on user status */}
      {user?.kycStatus === 'PENDING' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            Your KYC submission is pending review. This typically takes 24-48 hours.
          </p>
        </div>
      )}

      {user?.kycStatus === 'APPROVED' && (
        <div className="bg-[#26a69a]/10 border border-[#26a69a]/30 rounded-lg p-4">
          <p className="text-[#26a69a] flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Your identity has been verified. You have full access to the platform.
          </p>
        </div>
      )}

      {user?.kycStatus === 'REJECTED' && (
        <div className="bg-[#ef5350]/10 border border-[#ef5350]/30 rounded-lg p-4">
          <p className="text-[#ef5350] flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Your previous submission was rejected. Please resubmit your KYC.
          </p>
        </div>
      )}
      <div className="relative bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2962ff] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#2962ff]" />
            <span className="text-[#2962ff] font-bold text-sm">IDENTITY VERIFICATION</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Know Your Customer (KYC)</h1>
          <p className="text-gray-600 dark:text-[#8b949e] max-w-2xl">
            Complete our verification process to unlock full trading features and higher withdrawal limits
          </p>
        </div>
      </div>

      {/* Progress Steps - Only show when no KYC status or rejected */}
      {(!user?.kycStatus || user?.kycStatus === 'REJECTED') && (
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step > s.number
                      ? 'bg-[#26a69a] text-white'
                      : step === s.number
                      ? 'bg-[#2962ff] text-white ring-2 ring-[#2962ff]/50'
                      : 'bg-white dark:bg-[#0d1117] text-gray-600 dark:text-[#8b949e] border border-gray-300 dark:border-[#21262d]'
                  }`}
                >
                  {step > s.number ? '✓' : s.number}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      step > s.number ? 'bg-[#26a69a]' : 'bg-[#21262d]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {steps.map((s) => (
              <div key={s.number}>
                <p className="text-[#8b949e]">{s.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (!user?.kycStatus || user?.kycStatus === 'REJECTED') && (
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Personal Information</h2>
            <p className="text-gray-600 dark:text-[#8b949e]">Please provide your personal details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#8b949e] mb-2 block">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#21262d] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#8b949e] mb-2 block">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                className="w-full px-4 py-2.5 bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#21262d] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#8b949e] mb-2 block">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#21262d] text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#8b949e] mb-2 block">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#21262d] text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
              >
                <option value="">Select country</option>
                <option value="USA">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white font-medium rounded-lg transition-colors"
            >
              Skip (Limited Access)
            </button>
            <button
              onClick={handleNext}
              disabled={!validateStep()}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                validateStep()
                  ? 'bg-[#2962ff] hover:bg-[#1e47a0] text-white'
                  : 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
              }`}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Address Information */}
      {step === 2 && (!user?.kycStatus || user?.kycStatus === 'REJECTED') && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Residential Address</h2>
            <p className="text-[#8b949e]">Where do you currently reside?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#8b949e] mb-2 block">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#21262d] text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#8b949e] mb-2 block">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="New York"
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#21262d] text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#8b949e] mb-2 block">State/Province</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="NY"
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#21262d] text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#8b949e] mb-2 block">Postal Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="10001"
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#21262d] text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleBack}
              className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!validateStep()}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                validateStep()
                  ? 'bg-[#2962ff] hover:bg-[#1e47a0] text-white'
                  : 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
              }`}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: ID Document Upload */}
      {step === 3 && (!user?.kycStatus || user?.kycStatus === 'REJECTED') && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Government ID Document</h2>
            <p className="text-[#8b949e]">Upload a clear photo of your government-issued ID</p>
          </div>

          <div>
            <label className="text-sm font-medium text-[#8b949e] mb-2 block">Document Type</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#21262d] text-white rounded-lg focus:outline-none focus:border-[#2962ff]"
            >
              <option value="passport">Passport</option>
              <option value="driver_license">Driver's License</option>
              <option value="national_id">National ID Card</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Side */}
            <div>
              <label className="text-sm font-medium text-[#8b949e] mb-3 block">Front Side</label>
              <div className="border-2 border-dashed border-[#21262d] rounded-lg p-6 text-center hover:border-[#2962ff] transition-colors cursor-pointer relative">
                {formData.documentFront ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-[#26a69a] mx-auto" />
                    <p className="text-white font-medium">{formData.documentFront.name}</p>
                    <div className="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#26a69a] transition-all"
                        style={{ width: `${uploadProgress.documentFront}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#8b949e]">{uploadProgress.documentFront}%</p>
                  </div>
                ) : (
                  <>
                    <FileText className="h-12 w-12 text-[#8b949e] mx-auto mb-3" />
                    <p className="text-white font-medium">Click to upload</p>
                    <p className="text-xs text-[#8b949e]">PNG, JPG up to 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('documentFront', e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Back Side */}
            <div>
              <label className="text-sm font-medium text-[#8b949e] mb-3 block">Back Side</label>
              <div className="border-2 border-dashed border-[#21262d] rounded-lg p-6 text-center hover:border-[#2962ff] transition-colors cursor-pointer relative">
                {formData.documentBack ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-[#26a69a] mx-auto" />
                    <p className="text-white font-medium">{formData.documentBack.name}</p>
                    <div className="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#26a69a] transition-all"
                        style={{ width: `${uploadProgress.documentBack}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#8b949e]">{uploadProgress.documentBack}%</p>
                  </div>
                ) : (
                  <>
                    <FileText className="h-12 w-12 text-[#8b949e] mx-auto mb-3" />
                    <p className="text-white font-medium">Click to upload</p>
                    <p className="text-xs text-[#8b949e]">PNG, JPG up to 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('documentBack', e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleBack}
              className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!validateStep()}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                validateStep()
                  ? 'bg-[#2962ff] hover:bg-[#1e47a0] text-white'
                  : 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
              }`}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Selfie Verification */}
      {step === 4 && (!user?.kycStatus || user?.kycStatus === 'REJECTED') && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Selfie Verification</h2>
            <p className="text-[#8b949e]">Please upload a clear selfie holding your ID document</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-300 flex-shrink-0" />
            <p className="text-sm text-blue-300">Make sure your face is clearly visible and the ID is readable</p>
          </div>

          <div>
            <div className="border-2 border-dashed border-[#21262d] rounded-lg p-12 text-center hover:border-[#2962ff] transition-colors cursor-pointer relative">
              {formData.faceSelfie ? (
                <div className="space-y-2">
                  <CheckCircle className="h-16 w-16 text-[#26a69a] mx-auto" />
                  <p className="text-white font-medium">{formData.faceSelfie.name}</p>
                  <div className="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="h-full bg-[#26a69a] transition-all"
                      style={{ width: `${uploadProgress.faceSelfie}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#8b949e]">{uploadProgress.faceSelfie}% uploaded</p>
                </div>
              ) : (
                <>
                  <Camera className="h-16 w-16 text-[#8b949e] mx-auto mb-3" />
                  <p className="text-white font-medium text-lg">Click to upload selfie</p>
                  <p className="text-sm text-[#8b949e]">PNG, JPG up to 10MB</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('faceSelfie', e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleBack}
              className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!validateStep()}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                validateStep()
                  ? 'bg-[#2962ff] hover:bg-[#1e47a0] text-white'
                  : 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
              }`}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review and Submit */}
      {step === 5 && (!user?.kycStatus || user?.kycStatus === 'REJECTED') && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Review Information</h2>
            <p className="text-[#8b949e]">Please review your information before submitting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-white">Personal Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-[#8b949e]">Name</p>
                  <p className="text-white">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <p className="text-[#8b949e]">Date of Birth</p>
                  <p className="text-white">{formData.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-[#8b949e]">Country</p>
                  <p className="text-white">{formData.country}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-white">Address</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-[#8b949e]">Address</p>
                  <p className="text-white">{formData.address}</p>
                </div>
                <div>
                  <p className="text-[#8b949e]">City, State, Zip</p>
                  <p className="text-white">{formData.city}, {formData.state} {formData.zipCode}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-white">Documents</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#26a69a]" />
                  <p className="text-white">ID Front: {formData.documentFront?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#26a69a]" />
                  <p className="text-white">ID Back: {formData.documentBack?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#26a69a]" />
                  <p className="text-white">Selfie: {formData.faceSelfie?.name}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-white">Document Type</h3>
              <p className="text-white capitalize">{formData.documentType.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 rounded"
              />
              <span className="text-sm text-blue-300">
                I confirm that all information provided is accurate and true. I understand this is for identity verification purposes and agree to the KYC policy.
              </span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleBack}
              className="flex-1 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.agreedToTerms}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                formData.agreedToTerms
                  ? 'bg-[#26a69a] hover:bg-teal-600 text-white'
                  : 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
              }`}
            >
              Submit <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Success */}
      {step === 6 && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Under Review</h2>
            <p className="text-[#8b949e] max-w-md mx-auto">
              Your KYC documents have been received and are currently under review. This typically takes 24-48 hours. We'll notify you via email once the verification is complete.
            </p>
          </div>
          <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4">
            <p className="text-sm text-[#8b949e]">Reference Number</p>
            <p className="text-lg font-mono font-bold text-[#2962ff]">KYC-2024-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-3 bg-[#2962ff] hover:bg-[#1e47a0] text-white font-bold rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Step 7: Approved Status */}
      {step === 7 && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#26a69a]/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-[#26a69a]" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Identity Verified</h2>
            <p className="text-[#8b949e] max-w-md mx-auto">
              Congratulations! Your identity has been successfully verified. You now have full access to all trading features and higher withdrawal limits.
            </p>
          </div>
          <div className="bg-[#26a69a]/10 border border-[#26a69a]/30 rounded-lg p-4 space-y-2">
            <p className="text-sm text-[#8b949e]">Verification Status</p>
            <p className="text-lg font-bold text-[#26a69a]">✓ Approved</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-3 bg-[#2962ff] hover:bg-[#1e47a0] text-white font-bold rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/wallet'}
              className="px-8 py-3 bg-[#26a69a]/20 text-[#26a69a] font-bold rounded-lg border border-[#26a69a]/30 hover:bg-[#26a69a]/30 transition-colors"
            >
              View Wallet
            </button>
          </div>
        </div>
      )}

      {/* Step 8: Rejected Status */}
      {step === 8 && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#ef5350]/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-[#ef5350]" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Verification Rejected</h2>
            <p className="text-[#8b949e] max-w-md mx-auto">
              Your KYC verification was rejected. This may be due to document quality or other verification issues. You can submit new documents by clicking the button below.
            </p>
          </div>
          <div className="bg-[#ef5350]/10 border border-[#ef5350]/30 rounded-lg p-4 space-y-2">
            <p className="text-sm text-[#8b949e]">Verification Status</p>
            <p className="text-lg font-bold text-[#ef5350]">✗ Rejected</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  firstName: '',
                  lastName: '',
                  dateOfBirth: '',
                  country: '',
                  state: '',
                  city: '',
                  zipCode: '',
                  address: '',
                  documentType: 'passport',
                  documentFront: null,
                  documentBack: null,
                  faceSelfie: null,
                  agreedToTerms: false
                });
              }}
              className="flex-1 px-8 py-3 bg-[#2962ff] hover:bg-[#1e47a0] text-white font-bold rounded-lg transition-colors"
            >
              Resubmit KYC
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 px-8 py-3 bg-[#21262d] hover:bg-[#30363d] text-white font-bold rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
