import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  UsergroupAddOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { MemberStatistics } from '../types';

interface MemberStatisticsCardProps {
  statistics: MemberStatistics;
}

const MemberStatisticsCard: React.FC<MemberStatisticsCardProps> = ({ statistics }) => {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={12} sm={12} lg={6}>
        <Card
          className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
          size="small"
        >
          <Statistic
            title="Total Members"
            value={statistics.totalMembers}
            prefix={<UsergroupAddOutlined className="text-blue-600" />}
            valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={12} lg={6}>
        <Card
          className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
          size="small"
        >
          <Statistic
            title="Active Members"
            value={statistics.activeMembers}
            prefix={<CheckCircleOutlined className="text-green-600" />}
            valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={12} lg={6}>
        <Card
          className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
          size="small"
        >
          <Statistic
            title="New This Month"
            value={statistics.newMembers}
            prefix={<UserAddOutlined className="text-purple-600" />}
            valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={12} lg={6}>
        <Card
          className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
          size="small"
        >
          <Statistic
            title="Admin/Employee"
            value={Object.entries(statistics.types)
              .map(([type, count]) => `${type}:${count}`)
              .join(" ")}
            prefix={<UserSwitchOutlined className="text-gold-600" />}
            valueStyle={{ color: "#faad14", fontSize: "1.1rem" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default MemberStatisticsCard;
