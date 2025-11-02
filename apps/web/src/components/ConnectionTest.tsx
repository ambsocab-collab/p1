import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { getAMFEs, createAMFE } from '../services/amfe';
import type { AMFE } from '../types/database';

export const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [amfes, setAMFEs] = useState<AMFE[]>([]);
  const [testResult, setTestResult] = useState<string>('');
  const { user, isAnonymous } = useAuth();

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test basic connection by checking if we can query the database
      const { data, error } = await supabase
        .from('failure_modes')
        .select('count')
        .single();

      if (error) {
        throw error;
      }

      setStatus('connected');
      setMessage('Successfully connected to Supabase database');
      loadAMFEs();
    } catch (error: any) {
      setStatus('error');
      setMessage(`Connection failed: ${error.message}`);
      console.error('Connection test error:', error);
    }
  };

  const loadAMFEs = async () => {
    try {
      const data = await getAMFEs();
      setAMFEs(data);
    } catch (error: any) {
      console.error('Error loading AMFEs:', error);
    }
  };

  const testCreateAMFE = async () => {
    setTestResult('Creating test AMFE...');
    try {
      const testAMFE = await createAMFE({
        name: `Test AMFE - ${new Date().toLocaleTimeString()}`,
        type: 'DFMEA',
        description: 'This is a test AMFE created to verify database connectivity',
        metadata: { test: true, createdAt: new Date().toISOString() },
      });

      setTestResult(`Success! Created AMFE with ID: ${testAMFE.id}`);
      loadAMFEs();
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`);
      console.error('Error creating test AMFE:', error);
    }
  };

  const testRLS = async () => {
    setTestResult('Testing Row Level Security...');
    try {
      // Test that we can only see our own data
      const userAMFEs = await getAMFEs();
      setTestResult(`RLS Test: Found ${userAMFEs.length} AMFEs for current user (${isAnonymous ? 'anonymous' : 'authenticated'})`);
    } catch (error: any) {
      setTestResult(`RLS Test Error: ${error.message}`);
      console.error('RLS test error:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testing database connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Connection Test</h1>

        {/* Connection Status */}
        <div className={`p-6 rounded-lg mb-6 ${
          status === 'connected' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        } border`}>
          <h2 className={`text-lg font-semibold mb-2 ${
            status === 'connected' ? 'text-green-800' : 'text-red-800'
          }`}>
            Connection Status: {status === 'connected' ? 'Connected' : 'Error'}
          </h2>
          <p className={status === 'connected' ? 'text-green-600' : 'text-red-600'}>
            {message}
          </p>
        </div>

        {/* User Information */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Current User</h2>
          <div className="text-gray-600">
            <p><strong>ID:</strong> {user?.id || 'Not authenticated'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Name:</strong> {user?.full_name || 'N/A'}</p>
            <p><strong>Anonymous:</strong> {isAnonymous ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Database Operations Test */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Operations Test</h2>

          <div className="space-x-4 mb-4">
            <button
              onClick={testCreateAMFE}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Test AMFE
            </button>
            <button
              onClick={testRLS}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test RLS Policies
            </button>
            <button
              onClick={loadAMFEs}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh AMFEs
            </button>
          </div>

          {testResult && (
            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold text-gray-900 mb-2">Test Result:</h3>
              <p className="text-gray-600">{testResult}</p>
            </div>
          )}
        </div>

        {/* AMFEs List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User AMFEs ({amfes.length})
          </h2>

          {amfes.length === 0 ? (
            <p className="text-gray-500">No AMFEs found. Create one to test!</p>
          ) : (
            <div className="space-y-3">
              {amfes.map((amfe) => (
                <div key={amfe.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{amfe.name}</h3>
                      <p className="text-sm text-gray-600">Type: {amfe.type}</p>
                      <p className="text-sm text-gray-600">Status: {amfe.status}</p>
                      {amfe.description && (
                        <p className="text-sm text-gray-500 mt-1">{amfe.description}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Created: {new Date(amfe.created_at).toLocaleDateString()}</p>
                      <p>Updated: {new Date(amfe.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};