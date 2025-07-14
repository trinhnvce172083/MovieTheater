import React from 'react';
import { Card, Statistic } from 'antd';
import {
  UsergroupAddOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { MemberStatistics } from '../types';

interface MemberStatisticsCardProps {
  statistics: MemberStatistics;
  loading?: boolean;
}

const MemberStatisticsCard: React.FC<MemberStatisticsCardProps> = ({ 
  statistics, 
  loading = false 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Total Members"
          value={statistics.totalMembers}
          prefix={<UsergroupAddOutlined className="text-blue-600" />}
          loading={loading}
          valueStyle={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Active Members"
          value={statistics.activeMembers}
          prefix={<CheckCircleOutlined className="text-green-600" />}
          valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="New This Month"
          value={statistics.newMembers}
          prefix={<UserAddOutlined className="text-purple-600" />}
          loading={loading}
          valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Members"
          value={statistics.types.MEMBER || 0}
          prefix={<UserSwitchOutlined className="text-blue-500" />}
          valueStyle={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Admins"
          value={statistics.types.ADMIN || 0}
          prefix={<UserSwitchOutlined className="text-orange-500" />}
          valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default MemberStatisticsCard;
