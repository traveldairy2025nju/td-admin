import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Avatar, 
  Pagination, 
  Input, 
  Space,
  Button,
  Image,
  Modal,
  Empty,
  Spin,
  Tag,
  Tooltip,
  message
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useDiaryStore } from '../store/diaryStore';
import { Diary } from '../types';
import { formatDate, getRelativeTime, truncateText, htmlToText } from '../utils';
import DiaryDetail from '../components/DiaryDetail';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface RejectedDiariesProps {
  isAdmin: boolean;
}

const RejectedDiaries: React.FC<RejectedDiariesProps> = ({ isAdmin }) => {
  const { 
    rejectedDiaries, 
    rejectedDiariesLoading, 
    rejectedDiariesPagination, 
    rejectedDiariesError,
    fetchRejectedDiaries,
    adminDeleteDiary,
    operationLoading
  } = useDiaryStore();
  
  const [keyword, setKeyword] = useState('');
  const [currentDiary, setCurrentDiary] = useState<Diary | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  useEffect(() => {
    console.log('RejectedDiaries组件初始化，开始获取游记');
    fetchRejectedDiaries();
  }, [fetchRejectedDiaries]);
  
  // 添加额外的useEffect，监控rejectedDiaries的变化
  useEffect(() => {
    console.log('rejectedDiaries更新:', rejectedDiaries);
    console.log('rejectedDiaries数据类型:', typeof rejectedDiaries);
    console.log('rejectedDiaries是否为数组:', Array.isArray(rejectedDiaries));
    console.log('rejectedDiaries长度:', rejectedDiaries?.length);
    
    // 检查数据结构
    if (rejectedDiaries && rejectedDiaries.length > 0) {
      console.log('第一条游记数据:', JSON.stringify(rejectedDiaries[0]));
    }
  }, [rejectedDiaries]);
  
  const handleSearch = () => {
    console.log('执行搜索，关键词:', keyword);
    fetchRejectedDiaries({ page: 1, limit: rejectedDiariesPagination.limit, keyword });
  };
  
  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchRejectedDiaries({ 
      page, 
      limit: pageSize || rejectedDiariesPagination.limit, 
      keyword 
    });
  };
  
  const handleViewDiary = (diary: Diary) => {
    setCurrentDiary(diary);
    setViewModalVisible(true);
  };
  
  const showDeleteModal = (diary: Diary) => {
    if (!isAdmin) {
      message.warning('只有管理员可以删除游记');
      return;
    }
    setCurrentDiary(diary);
    setDeleteModalVisible(true);
  };
  
  const handleDeleteDiary = async () => {
    if (!currentDiary || !isAdmin) return;
    
    try {
      await adminDeleteDiary(currentDiary.id);
      setDeleteModalVisible(false);
      message.success('游记已删除');
      setViewModalVisible(false);
    } catch (error) {
      console.error('删除失败:', error);
    }
  };
  
  const renderDiaryCard = (diary: Diary) => {
    const cardActions = [
      <Button 
        key="view"
        type="text" 
        icon={<EyeOutlined />} 
        onClick={() => handleViewDiary(diary)}
      >
        查看
      </Button>
    ];
    
    // 只有管理员可以删除游记
    if (isAdmin) {
      cardActions.push(
        <Button 
          key="delete"
          type="text" 
          danger
          icon={<DeleteOutlined />}
          onClick={() => showDeleteModal(diary)}
          loading={operationLoading}
        >
          删除
        </Button>
      );
    }
    
    return (
      <Card
        hoverable
        cover={
          diary.images && diary.images.length > 0 ? (
            <div 
              style={{ 
                height: 260, 
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <img
                alt={diary.title}
                src={diary.images[0]}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {diary.videoUrl && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PlayCircleOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
              )}
              {diary.images.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                >
                  +{diary.images.length - 1}
                </div>
              )}
            </div>
          ) : (
            <div 
              style={{ 
                height: 260, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f5f5f5'
              }}
            >
              <Text type="secondary">无图片</Text>
            </div>
          )
        }
        actions={cardActions}
      >
        <div style={{ height: 90, overflow: 'auto' }}>
          <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
            {truncateText(diary.title, 30)}
          </Title>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <Avatar 
              icon={<UserOutlined />} 
              src={diary.author.avatarUrl} 
              size="small" 
              style={{ marginRight: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {diary.author.nickname || diary.author.username}
            </Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {getRelativeTime(diary.createdAt)}
            </Text>
            <Text type="danger" style={{ fontSize: 12 }}>
              <CloseCircleOutlined style={{ marginRight: 4 }} />
              已拒绝
            </Text>
          </div>
          
          {diary.rejectReason && (
            <div style={{ marginTop: 8 }}>
              <Tooltip title={diary.rejectReason}>
                <Tag 
                  color="error" 
                  icon={<InfoCircleOutlined />}
                  style={{
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  拒绝原因: {truncateText(diary.rejectReason, 15)}
                </Tag>
              </Tooltip>
            </div>
          )}
        </div>
      </Card>
    );
  };
  
  return (
    <div>
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>已拒绝游记</Title>
        <Space>
          <Search
            placeholder="搜索游记标题"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>
      </div>
      
      {rejectedDiariesError && (
        <div style={{ marginBottom: 16 }}>
          <Text type="danger">{rejectedDiariesError}</Text>
        </div>
      )}
      
      {rejectedDiariesLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {rejectedDiaries.length === 0 ? (
            <Card>
              <Empty description="暂无已拒绝的游记" />
            </Card>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", justifyContent: "flex-start" }}>
                {rejectedDiaries.map((diary) => (
                  <div key={diary.id} style={{ width: "calc(25% - 12px)", minWidth: "280px", maxWidth: "300px", marginBottom: "16px" }}>
                    {renderDiaryCard(diary)}
                  </div>
                ))}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={rejectedDiariesPagination.page}
                  pageSize={rejectedDiariesPagination.limit}
                  total={rejectedDiariesPagination.total}
                  onChange={handlePaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条记录`}
                />
              </div>
            </>
          )}
        </>
      )}
      
      {/* 游记详情模态框 */}
      <Modal
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px', maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}
      >
        {currentDiary && (
          <DiaryDetail
            diary={currentDiary}
            isAdmin={isAdmin}
            onDelete={() => {
              setViewModalVisible(false);
              showDeleteModal(currentDiary);
            }}
            onClose={() => setViewModalVisible(false)}
            operationLoading={operationLoading}
          />
        )}
      </Modal>
      
      {/* 删除确认对话框 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDeleteDiary}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true, loading: operationLoading }}
      >
        <p>确定要删除这篇游记吗？此操作不可撤销。</p>
      </Modal>
    </div>
  );
};

export default RejectedDiaries; 