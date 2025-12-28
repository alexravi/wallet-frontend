import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { accountService } from '../services/accountService';
import { statementService } from '../services/statementService';
import { BankAccount } from '../types/account.types';
import FileUpload from '../components/accounts/FileUpload';
import Card from '../design-system/components/ui/Card';
import Select from '../design-system/components/ui/Select';
import Button from '../design-system/components/ui/Button';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

const StatementUpload: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountIdParam = searchParams.get('accountId');

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accountIdParam || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      const accounts = await accountService.getBankAccounts();
      setBankAccounts(accounts);
      if (accountIdParam && accounts.some((acc) => acc._id === accountIdParam)) {
        setSelectedAccountId(accountIdParam);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bank accounts');
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!selectedAccountId) {
      setError('Please select a bank account');
      return;
    }

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const statement = await statementService.uploadStatement(selectedFile, selectedAccountId);
      setSuccess('Statement uploaded successfully! Parsing transactions...');
      
      // Automatically trigger parsing
      setTimeout(async () => {
        try {
          await statementService.parseStatement(statement._id);
          navigate(`/accounts/statement/${statement._id}/review`);
        } catch (parseErr: any) {
          setError(`Upload successful but parsing failed: ${parseErr.message}`);
          setUploading(false);
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload statement');
      setUploading(false);
    }
  };

  const accountOptions = [
    { value: '', label: '-- Select Bank Account --' },
    ...bankAccounts.map((account) => ({
      value: account._id,
      label: `${account.bankName} - ${account.accountNumber}`,
    })),
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Bank Statement</h1>
        <p className="text-gray-600">
          Upload your bank statement (PDF or CSV) to automatically import transactions
        </p>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-error-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-error-600 font-medium">Error</p>
              <p className="text-error-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-md flex items-start">
            <CheckCircle className="h-5 w-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-success-600 font-medium">Success</p>
              <p className="text-success-600 text-sm mt-1">{success}</p>
            </div>
            {uploading && (
              <LoadingSpinner size="sm" className="ml-4" />
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* Bank Account Selection */}
          <div>
            <Select
              label="Select Bank Account"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              required
              disabled={uploading}
              options={accountOptions}
              helperText="Choose the bank account this statement belongs to"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Statement File
            </label>
            <FileUpload 
              onFileSelect={handleFileSelect} 
              accept=".pdf,.csv" 
              maxSize={10} 
            />
            {selectedFile && (
              <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-md flex items-center">
                <FileText className="h-5 w-5 text-primary-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => navigate('/accounts')}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !selectedAccountId}
              isLoading={uploading}
            >
              {uploading ? 'Uploading & Parsing...' : 'Upload & Parse'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="mt-6 p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">How to upload statements:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Select the bank account this statement belongs to</li>
          <li>Drag and drop your statement file (PDF or CSV) or click to browse</li>
          <li>Click "Upload & Parse" to upload and automatically parse transactions</li>
          <li>Review and confirm the parsed transactions</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">
          Supported formats: PDF, CSV | Maximum file size: 10MB
        </p>
      </Card>
    </div>
  );
};

export default StatementUpload;
