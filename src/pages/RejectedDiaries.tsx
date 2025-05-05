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
  Drawer,
  message,
  Tag
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
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
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
    setViewDrawerVisible(true);
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
        style={{ marginBottom: 16 }}
        cover={
          diary.images && diary.images.length > 0 ? (
            <div 
              style={{ 
                height: 200, 
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
                height: 200, 
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
        <div style={{ marginBottom: 8 }}>
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
              <Tag color="error" icon={<InfoCircleOutlined />}>
                拒绝原因: {truncateText(diary.rejectReason, 20)}
              </Tag>
            </div>
          )}
        </div>
      </Card>
    );
  };
  
  return (
    <div>
      <div className="content-header">
        <Title level={3}>已拒绝游记</Title>
        <div className="content-header-actions">
          <Space>
            <Search
              placeholder="搜索游记标题"
              allowClear
              enterButton
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
          </Space>
        </div>
      </div>
      
      <div style={{ marginTop: 16 }}>
        {rejectedDiariesLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : rejectedDiariesError ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="danger">{rejectedDiariesError}</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => fetchRejectedDiaries()}>
                重试
              </Button>
            </div>
          </div>
        ) : rejectedDiaries.length === 0 ? (
          <Empty description="暂无拒绝的游记" style={{ padding: '40px 0' }} />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {rejectedDiaries.map((diary) => (
                <Col xs={24} sm={12} md={8} lg={8} xl={6} key={diary.id}>
                  {renderDiaryCard(diary)}
                </Col>
              ))}
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 16 }}>
              <Pagination 
                current={rejectedDiariesPagination.page} 
                pageSize={rejectedDiariesPagination.limit}
                total={rejectedDiariesPagination.total}
                onChange={handlePaginationChange}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={['10', '20', '50']}
              />
            </div>
          </>
        )}
      </div>
      
      {/* 查看游记详情抽屉 */}
      <Drawer
        title={currentDiary?.title || '游记详情'}
        placement="right"
        width={720}
        onClose={() => setViewDrawerVisible(false)}
        open={viewDrawerVisible}
      >
        {currentDiary && (
          <div>
            <div className="diary-detail-header">
              <div className="diary-detail-author">
                <Avatar 
                  icon={<UserOutlined />} 
                  src={currentDiary.author.avatarUrl} 
                  size="small" 
                  style={{ marginRight: 8 }}
                />
                <Text>{currentDiary.author.nickname || currentDiary.author.username}</Text>
              </div>
              <div className="diary-detail-meta">
                <Text type="secondary">发布于 {formatDate(currentDiary.createdAt)}</Text>
              </div>
            </div>
            
            {currentDiary.rejectReason && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <Card 
                  title={<span style={{ color: '#f5222d' }}><CloseCircleOutlined /> 拒绝原因</span>}
                  style={{ borderColor: '#ffccc7' }}
                >
                  <Text>{currentDiary.rejectReason}</Text>
                </Card>
              </div>
            )}
            
            <div className="diary-detail-content" style={{ marginTop: 16 }}>
              <div className="diary-detail-html-content" 
                dangerouslySetInnerHTML={{ __html: currentDiary.content }}
              />
            </div>
            
            {currentDiary.images && currentDiary.images.length > 0 && (
              <div className="diary-detail-images" style={{ marginTop: 24 }}>
                <Title level={5}>图片</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {currentDiary.images.map((image, index) => (
                    <div key={index} style={{ width: '150px', position: 'relative' }}>
                      <img
                        src={image}
                        alt={`游记图片 ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '150px', 
                          objectFit: 'cover',
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                        onClick={() => setPreviewImage(image)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentDiary.videoUrl && (
              <div className="diary-detail-video" style={{ marginTop: 24 }}>
                <Title level={5}>视频</Title>
                <div>
                  <video 
                    controls 
                    style={{ width: '100%', maxHeight: '400px' }}
                    src={currentDiary.videoUrl}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
      
      {/* 图片预览 */}
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible: !!previewImage,
            onVisibleChange: (visible) => {
              if (!visible) setPreviewImage(null);
            },
            current: currentDiary?.images?.findIndex(img => img === previewImage) || 0,
          }}
        >
          {currentDiary?.images?.map((image, index) => (
            <Image key={index} src={image} />
          ))}
        </Image.PreviewGroup>
      </div>
      
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