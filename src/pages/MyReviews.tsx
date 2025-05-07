import React, { useEffect, useState, useMemo } from 'react';
import { 
  Card, 
  Radio, 
  Space, 
  Typography, 
  Tabs, 
  Table, 
  Tag, 
  Button, 
  Avatar,
  Empty,
  Spin,
  Tooltip,
  DatePicker,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import dayjs from 'dayjs';
import { useDiaryStore } from '../store/diaryStore';
import { Diary } from '../types';
import { formatDate, getRelativeTime } from '../utils';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface MyReviewsProps {}

// 定义图表数据结构
interface ChartData {
  date: string;
  total: number;
  approved: number;
  rejected: number;
  approvalRate: number;
}

const MyReviews: React.FC<MyReviewsProps> = () => {
  const { 
    myReviewedDiaries, 
    myReviewedDiariesLoading, 
    myReviewedDiariesPagination, 
    myReviewedDiariesError,
    fetchMyReviewedDiaries,
  } = useDiaryStore();
  
  const [timeRange, setTimeRange] = useState<number>(30); // 默认展示30天
  const [currentTab, setCurrentTab] = useState<string>('all'); // 默认展示所有游记
  
  useEffect(() => {
    fetchMyReviewedDiaries({ days: timeRange });
  }, [fetchMyReviewedDiaries, timeRange]);
  
  // 根据当前选择的时间范围筛选日期
  const filteredDiaries = useMemo(() => {
    if (currentTab === 'all') {
      return myReviewedDiaries;
    } else if (currentTab === 'approved') {
      return myReviewedDiaries.filter(diary => diary.status === 'approved');
    } else {
      return myReviewedDiaries.filter(diary => diary.status === 'rejected');
    }
  }, [myReviewedDiaries, currentTab]);
  
  // 生成图表数据
  const chartData = useMemo(() => {
    // 创建从当前日期向前推timeRange天的日期映射
    const dateMap = new Map<string, ChartData>();
    const today = dayjs().startOf('day');
    
    for (let i = 0; i < timeRange; i++) {
      const date = today.subtract(i, 'day').format('YYYY-MM-DD');
      dateMap.set(date, {
        date,
        total: 0,
        approved: 0,
        rejected: 0,
        approvalRate: 0
      });
    }
    
    // 遍历审核记录，按日期分组计数
    myReviewedDiaries.forEach(diary => {
      // 使用updatedAt作为审核日期
      const reviewDate = dayjs(diary.updatedAt).format('YYYY-MM-DD');
      
      // 如果这个日期在我们的范围内
      if (dateMap.has(reviewDate)) {
        const dayData = dateMap.get(reviewDate)!;
        dayData.total += 1;
        
        if (diary.status === 'approved') {
          dayData.approved += 1;
        } else if (diary.status === 'rejected') {
          dayData.rejected += 1;
        }
        
        // 计算通过率
        dayData.approvalRate = dayData.total > 0 
          ? Math.round((dayData.approved / dayData.total) * 100) 
          : 0;
      }
    });
    
    // 将Map转为数组并按日期排序
    return Array.from(dateMap.values())
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  }, [myReviewedDiaries, timeRange]);
  
  // 计算统计数据
  const statistics = useMemo(() => {
    const total = myReviewedDiaries.length;
    const approved = myReviewedDiaries.filter(d => d.status === 'approved').length;
    const rejected = myReviewedDiaries.filter(d => d.status === 'rejected').length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    return { total, approved, rejected, approvalRate };
  }, [myReviewedDiaries]);
  
  // 定义表格列
  const columns: ColumnsType<Diary> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      render: (author) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            icon={<UserOutlined />} 
            src={author.avatarUrl} 
            size="small" 
            style={{ marginRight: 8 }}
          />
          {author.nickname || author.username}
        </div>
      ),
    },
    {
      title: '审核结果',
      key: 'status',
      dataIndex: 'status',
      render: (status) => (
        <>
          {status === 'approved' ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              已通过
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="error">
              已拒绝
            </Tag>
          )}
        </>
      ),
    },
    {
      title: '审核时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => (
        <Tooltip title={formatDate(date, 'YYYY-MM-DD HH:mm:ss')}>
          <span>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {getRelativeTime(date)}
          </span>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: '拒绝原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      render: (reason, record) => (
        record.status === 'rejected' && reason ? (
          <Tooltip title={reason}>
            <Text ellipsis style={{ maxWidth: 200 }}>{reason}</Text>
          </Tooltip>
        ) : null
      ),
    },
  ];
  
  const handleTimeRangeChange = (e: any) => {
    setTimeRange(e.target.value);
  };
  
  const handleTabChange = (key: string) => {
    setCurrentTab(key);
  };
  
  const handleTableChange = (pagination: any) => {
    fetchMyReviewedDiaries({
      days: timeRange,
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };
  
  return (
    <div>
      <div className="content-header">
        <Title level={3}>我的审核记录</Title>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总审核数"
              value={statistics.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已通过"
              value={statistics.approved}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已拒绝"
              value={statistics.rejected}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="通过率"
              value={statistics.approvalRate}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix={<LineChartOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
      
      {/* 时间范围选择器 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>时间范围：</Text>
            <Radio.Group value={timeRange} onChange={handleTimeRangeChange}>
              <Radio.Button value={7}>最近7天</Radio.Button>
              <Radio.Button value={30}>最近30天</Radio.Button>
            </Radio.Group>
          </Space>
        </div>
        
        {/* 折线图 */}
        <div style={{ height: 300, marginBottom: 24 }}>
          {myReviewedDiariesLoading ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spin />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => dayjs(value).format('MM-DD')}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <RechartsTooltip 
                  formatter={(value: any, name: any) => {
                    if (name === '通过率') return `${value}%`;
                    return value;
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  name="总审核数"
                  stroke="#1890ff"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="approved"
                  name="通过数"
                  stroke="#52c41a"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rejected"
                  name="拒绝数"
                  stroke="#f5222d"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="approvalRate"
                  name="通过率"
                  stroke="#722ed1"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
      
      {/* 审核记录列表 */}
      <Card>
        <Tabs activeKey={currentTab} onChange={handleTabChange}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="已通过" key="approved" />
          <TabPane tab="已拒绝" key="rejected" />
        </Tabs>
        
        <Table
          columns={columns}
          dataSource={filteredDiaries}
          rowKey="id"
          loading={myReviewedDiariesLoading}
          pagination={{
            current: myReviewedDiariesPagination.page,
            pageSize: myReviewedDiariesPagination.limit,
            total: myReviewedDiariesPagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: <Empty description="暂无审核记录" />,
          }}
        />
      </Card>
    </div>
  );
};

export default MyReviews; 