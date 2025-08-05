/**
 * Admin Schedule Management Test Component
 * Test connectivity and basic functionality
 */

"use client";

import React, { useState } from 'react';
import { Button, Card, Space, Typography, Alert, Spin } from 'antd';
import { scheduleApiService } from '@/api/admin/scheduleService';

const { Title, Text } = Typography;

export default function ScheduleTestPage() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runConnectivityTest = async () => {
    setLoading(true);
    const results: any[] = [];

    try {
      // Test 1: Get movie options
      console.log('Testing movie options...');
      try {
        const movies = await scheduleApiService.getMovieOptions();
        results.push({
          test: 'Movie Options',
          status: 'success',
          data: `Found ${movies.length} movies`,
          details: movies.slice(0, 3)
        });
      } catch (error: any) {
        results.push({
          test: 'Movie Options',
          status: 'error',
          error: error.message,
          details: error
        });
      }

      // Test 2: Get room options
      console.log('Testing room options...');
      try {
        const rooms = await scheduleApiService.getRoomOptions();
        results.push({
          test: 'Room Options',
          status: 'success',
          data: `Found ${rooms.length} rooms`,
          details: rooms.slice(0, 3)
        });
      } catch (error: any) {
        results.push({
          test: 'Room Options',
          status: 'error',
          error: error.message,
          details: error
        });
      }

      // Test 3: Get schedules
      console.log('Testing schedules...');
      try {
        const schedulesResponse = await scheduleApiService.getAllSchedules();
        results.push({
          test: 'Get Schedules',
          status: 'success',
          data: `Found ${schedulesResponse.schedules.length} schedules`,
          details: schedulesResponse.schedules.slice(0, 2)
        });
      } catch (error: any) {
        results.push({
          test: 'Get Schedules',
          status: 'error',
          error: error.message,
          details: error
        });
      }

      // Test 4: Get statistics
      console.log('Testing statistics...');
      try {
        const stats = await scheduleApiService.getScheduleStatistics();
        results.push({
          test: 'Statistics',
          status: 'success',
          data: 'Statistics loaded successfully',
          details: stats
        });
      } catch (error: any) {
        results.push({
          test: 'Statistics',
          status: 'error',
          error: error.message,
          details: error
        });
      }

    } catch (error) {
      console.error('Overall test error:', error);
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>Admin Schedule Management - Connectivity Test</Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Phase 1 Implementation Test"
            description="Testing basic connectivity between frontend Schedule Management system and backend APIs. This verifies the admin-member data flow compatibility."
            type="info"
            showIcon
          />

          <Button 
            type="primary" 
            size="large"
            onClick={runConnectivityTest}
            loading={loading}
          >
            Run Connectivity Tests
          </Button>

          {testResults.length > 0 && (
            <div>
              <Title level={4}>Test Results:</Title>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {testResults.map((result, index) => (
                  <Card 
                    key={index}
                    size="small"
                    style={{ 
                      borderLeft: `4px solid ${result.status === 'success' ? '#52c41a' : '#ff4d4f'}`
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Text strong>{result.test}: </Text>
                        <Text type={result.status === 'success' ? 'success' : 'danger'}>
                          {result.status === 'success' ? '✅ Success' : '❌ Failed'}
                        </Text>
                      </div>
                      
                      {result.data && (
                        <Text>{result.data}</Text>
                      )}
                      
                      {result.error && (
                        <Text type="danger">Error: {result.error}</Text>
                      )}
                      
                      {result.details && (
                        <details>
                          <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
                            View Details
                          </summary>
                          <pre style={{ 
                            marginTop: '8px', 
                            padding: '12px', 
                            background: '#f5f5f5', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            overflow: 'auto'
                          }}>
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </Space>
                  </Card>
                ))}
              </Space>
            </div>
          )}

          <Alert
            message="Implementation Notes"
            description={
              <div>
                <p><strong>Completed Features:</strong></p>
                <ul>
                  <li>✅ Complete type definitions for admin-member compatibility</li>
                  <li>✅ Schedule API service with full CRUD operations</li>
                  <li>✅ useScheduleManagement hook with state management</li>
                  <li>✅ Schedule form with conflict detection</li>
                  <li>✅ Schedule table with booking information display</li>
                  <li>✅ Filter system for schedule management</li>
                  <li>✅ Admin layout integration</li>
                </ul>
                <p><strong>Member Booking Compatibility:</strong></p>
                <ul>
                  <li>✅ AdminSchedule interface includes all member booking requirements</li>
                  <li>✅ Data transformation for member-friendly display (displayTime, isBookable, etc.)</li>
                  <li>✅ API endpoints match existing member booking flow</li>
                </ul>
              </div>
            }
            type="success"
          />
        </Space>
      </Card>
    </div>
  );
}
