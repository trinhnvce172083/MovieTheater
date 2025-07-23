'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Divider, Descriptions } from 'antd';
import { getAllPromotions } from '@/api/admin/getAllPromotions';
import { PromotionDto } from '@/types/Admin/promotion';

const { Title, Text, Paragraph } = Typography;

export const PromotionDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>({});

  const checkEnvironment = () => {
    const info = {
      baseURL: 'http://localhost:8080/cinema/api',
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      isLoggedIn: localStorage.getItem('isLoggedIn'),
      userInfo: localStorage.getItem('userInfo'),
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
    };
    setDebugInfo(info);
    return info;
  };

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      console.log('🔍 Testing Promotion API...');
      
      // Check environment first
      const envInfo = checkEnvironment();
      console.log('Environment info:', envInfo);
      
      // Test API call
      console.log('📡 Making API call to /promotions...');
      const response = await getAllPromotions({ page: 0, size: 5 });
      
      console.log('✅ API Response:', response);
      setResult(response);
      
    } catch (err: any) {
      console.error('❌ API Error:', err);
      setError(err.message || 'Unknown error');
      
      // Log detailed error info
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Request error:', err.request);
      }
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      console.log('🔍 Testing direct fetch...');
      
      const token = localStorage.getItem('accessToken');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:8080/cinema/api/promotions?page=0&size=5', {
        method: 'GET',
        headers,
      });
      
      console.log('📡 Direct fetch response status:', response.status);
      console.log('📡 Direct fetch response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Direct fetch data:', data);
      setResult(data);
      
    } catch (err: any) {
      console.error('❌ Direct fetch error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  return (
    <Card title="🔧 Promotion API Debug" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          Component này giúp debug các vấn đề với Promotion API.
          Kiểm tra console để xem thông tin chi tiết.
        </Paragraph>
        
        <Space wrap>
          <Button 
            type="primary" 
            onClick={testAPI} 
            loading={loading}
            size="large"
          >
            Test API via Axios
          </Button>
          
          <Button 
            onClick={testDirectFetch} 
            loading={loading}
            size="large"
          >
            Test Direct Fetch
          </Button>
        </Space>

        {/* Environment Info */}
        <Divider>Environment Information</Divider>
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Base URL">
            {debugInfo.baseURL}
          </Descriptions.Item>
          <Descriptions.Item label="Access Token">
            {debugInfo.accessToken ? `${debugInfo.accessToken.substring(0, 20)}...` : 'Not found'}
          </Descriptions.Item>
          <Descriptions.Item label="Refresh Token">
            {debugInfo.refreshToken ? `${debugInfo.refreshToken.substring(0, 20)}...` : 'Not found'}
          </Descriptions.Item>
          <Descriptions.Item label="Is Logged In">
            {debugInfo.isLoggedIn || 'false'}
          </Descriptions.Item>
          <Descriptions.Item label="Current URL">
            {debugInfo.currentUrl}
          </Descriptions.Item>
        </Descriptions>

        {/* Error Display */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {/* Result Display */}
        {result && (
          <div style={{ marginTop: 16 }}>
            <Title level={4}>API Response:</Title>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: 16, 
              borderRadius: 4, 
              overflow: 'auto',
              maxHeight: 400 
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Troubleshooting Tips */}
        <Divider>Troubleshooting Tips</Divider>
        <Alert
          message="Common Issues & Solutions"
          description={
            <ul>
              <li><strong>404 Not Found:</strong> Backend server chưa chạy hoặc endpoint không đúng</li>
              <li><strong>401 Unauthorized:</strong> Token không hợp lệ hoặc hết hạn</li>
              <li><strong>403 Forbidden:</strong> Không có quyền truy cập API</li>
              <li><strong>CORS Error:</strong> Backend chưa cấu hình CORS</li>
              <li><strong>Network Error:</strong> Backend server không thể kết nối</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
}; 