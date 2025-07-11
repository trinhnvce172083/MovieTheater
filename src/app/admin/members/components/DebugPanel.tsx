import React, { useState } from 'react';
import { Card, Button, Typography, Space, Divider } from 'antd';
import { BugOutlined } from '@ant-design/icons';
import axiosClient from '@/api/axiosClient';

const { Text, Paragraph } = Typography;

interface DebugPanelProps {
  visible?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ visible = false }) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any) => {
    setTestResults(prev => [...prev, { test, success, data, timestamp: new Date().toISOString() }]);
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      addResult('Token Check', !!token, { hasToken: !!token, tokenLength: token?.length });
      
      if (token) {
        // Test basic API access
        const response = await axiosClient.get('/admin/users?page=0&size=1');
        addResult('API Access Test', true, { status: response.status, dataLength: response.data?.content?.length });
      }
    } catch (error: any) {
      addResult('API Access Test', false, { 
        status: error.response?.status, 
        message: error.message,
        data: error.response?.data 
      });
    }
    setLoading(false);
  };

  const testLockEndpoint = async () => {
    setLoading(true);
    try {
      // Test with a dummy request to see the response
      await axiosClient.post('/admin/users/999/lock', {
        reason: 'Test lock',
        lockHours: 1,
        sendNotificationEmail: false,
        notes: 'Debug test'
      });
    } catch (error: any) {
      addResult('Lock Endpoint Test', false, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        data: error.response?.data
      });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!visible) return null;

  return (
    <Card 
      title={
        <Space>
          <BugOutlined />
          <span>Debug Panel</span>
        </Space>
      }
      className="mb-4"
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button size="small" onClick={testAuth} loading={loading}>
            Test Auth
          </Button>
          <Button size="small" onClick={testLockEndpoint} loading={loading}>
            Test Lock Endpoint
          </Button>
          <Button size="small" onClick={clearResults}>
            Clear Results
          </Button>
        </Space>
        
        <Divider style={{ margin: '8px 0' }} />
        
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {testResults.map((result, index) => (
            <Card key={index} size="small" className={`mb-2 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
              <Text strong className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.test}: {result.success ? 'SUCCESS' : 'FAILED'}
              </Text>
              <Paragraph className="mb-0 mt-1">
                <Text code style={{ fontSize: '11px' }}>
                  {JSON.stringify(result.data, null, 2)}
                </Text>
              </Paragraph>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                {result.timestamp}
              </Text>
            </Card>
          ))}
        </div>
      </Space>
    </Card>
  );
};

export default DebugPanel;
