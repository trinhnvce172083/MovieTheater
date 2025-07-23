'use client';

import React, { useState } from 'react';
import { Button, Card, Space, Typography, Alert } from 'antd';
import { testPromotionAPI } from '@/utils/promotion-test-utils';

const { Title, Text } = Typography;

export const PromotionAPITest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTest = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const success = await testPromotionAPI();
      setResult(success ? 'API test passed successfully!' : 'API test failed. Check console for details.');
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Promotion API Test" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>
          Click the button below to test the Promotion API endpoints.
          Check the browser console for detailed logs.
        </Text>
        
        <Button 
          type="primary" 
          onClick={handleTest} 
          loading={loading}
          size="large"
        >
          Test Promotion API
        </Button>
        
        {result && (
          <Alert
            message={result}
            type={result.includes('passed') ? 'success' : 'error'}
            showIcon
          />
        )}
      </Space>
    </Card>
  );
}; 