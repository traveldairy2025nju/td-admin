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
  message
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useDiaryStore } from '../store/diaryStore';
import { Diary } from '../types';
import { formatDate, getRelativeTime, truncateText, htmlToText } from '../utils';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface ApprovedDiariesProps {
  isAdmin: boolean;
}

const ApprovedDiaries: React.FC<ApprovedDiariesProps> = ({ isAdmin }) => {
  const { 
    publicDiaries, 
    publicDiariesLoading, 
    publicDiariesPagination, 
    publicDiariesError,
    fetchPublicDiaries,
    adminDeleteDiary,
    operationLoading
  } = useDiaryStore();
  
  const [keyword, setKeyword] = useState('');
  const [currentDiary, setCurrentDiary] = useState<Diary | null>(null);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('ApprovedDiaries组件初始化，开始获取游记');
    fetchPublicDiaries();
  }, [fetchPublicDiaries]);
  
  // 添加额外的useEffect，监控publicDiaries的变化
  useEffect(() => {
    console.log('publicDiaries更新:', publicDiaries);
    console.log('publicDiaries数据类型:', typeof publicDiaries);
    console.log('publicDiaries是否为数组:', Array.isArray(publicDiaries));
    console.log('publicDiaries长度:', publicDiaries?.length);
    
    // 检查数据结构
    if (publicDiaries && publicDiaries.length > 0) {
      console.log('第一条游记数据:', JSON.stringify(publicDiaries[0]));
    }
  }, [publicDiaries]);
  
  const handleSearch = () => {
    console.log('执行搜索，关键词:', keyword);
    fetchPublicDiaries({ page: 1, limit: publicDiariesPagination.limit, keyword });
  };
  
  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchPublicDiaries({ 
      page, 
      limit: pageSize || publicDiariesPagination.limit, 
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
            <Text type="success" style={{ fontSize: 12 }}>
              <CheckCircleOutlined style={{ marginRight: 4 }} />
              已通过
            </Text>
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <div>
      <div className="content-header">
        <Title level={3}>已审核通过游记</Title>
        
        <Space>
          <Search
            placeholder="搜索游记标题"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
        </Space>
      </div>
      
      {publicDiariesError && (
        <div style={{ marginBottom: 16 }}>
          <Text type="danger">{publicDiariesError}</Text>
        </div>
      )}
      
      {publicDiariesLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {publicDiaries.length === 0 ? (
            <Card>
              <Empty description="暂无已审核通过的游记" />
            </Card>
          ) : (
            <>
              <div className="card-grid">
                {publicDiaries.map((diary) => (
                  <div key={diary.id}>
                    {renderDiaryCard(diary)}
                  </div>
                ))}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={publicDiariesPagination.page}
                  pageSize={publicDiariesPagination.limit}
                  total={publicDiariesPagination.total}
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
      
      {/* 查看游记抽屉 */}
      <Drawer
        title="游记详情"
        width={720}
        open={viewDrawerVisible}
        onClose={() => setViewDrawerVisible(false)}
        extra={
          isAdmin ? (
            <Button 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setViewDrawerVisible(false);
                if (currentDiary) {
                  showDeleteModal(currentDiary);
                }
              }}
              loading={operationLoading}
            >
              删除
            </Button>
          ) : null
        }
      >
        {currentDiary ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>{currentDiary.title}</Title>
              <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  src={currentDiary.author.avatarUrl} 
                  style={{ marginRight: 8 }}
                />
                <span style={{ marginRight: 16 }}>
                  {currentDiary.author.nickname || currentDiary.author.username}
                </span>
                <span>
                  {formatDate(currentDiary.createdAt, 'YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
            </div>
            
            {currentDiary.images && currentDiary.images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>游记图片：</Text>
                <div className="image-preview">
                  {currentDiary.images.map((img, index) => (
                    <div 
                      key={index} 
                      className="image-preview-item"
                      onClick={() => setPreviewImage(img)}
                    >
                      <img src={img} alt={`游记图片 ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentDiary.videoUrl && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>视频：</Text>
                <div style={{ marginTop: 8 }}>
                  <video 
                    controls 
                    src={currentDiary.videoUrl} 
                    style={{ width: '100%', maxHeight: 300 }}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Text strong>游记内容：</Text>
              <div 
                className="diary-content"
                dangerouslySetInnerHTML={{ __html: currentDiary.content }}
                style={{ 
                  marginTop: 8, 
                  padding: 16, 
                  border: '1px solid #f0f0f0', 
                  borderRadius: 4,
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
              />
            </div>
          </div>
        ) : (
          <Spin />
        )}
      </Drawer>
      
      {/* 图片预览 */}
      <div style={{ display: 'none' }}>
        <Image
          preview={{
            visible: !!previewImage,
            src: previewImage || '',
            onVisibleChange: (visible) => {
              if (!visible) {
                setPreviewImage(null);
              }
            },
          }}
        />
      </div>
      
      {/* 删除游记模态框 */}
      {isAdmin && (
        <Modal
          title="删除游记"
          open={deleteModalVisible}
          onOk={handleDeleteDiary}
          onCancel={() => setDeleteModalVisible(false)}
          confirmLoading={operationLoading}
          okText="确认删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <div>
            <Text>您确定要删除以下游记吗？此操作不可逆。</Text>
            <Paragraph strong style={{ margin: '8px 0' }}>
              {currentDiary?.title}
            </Paragraph>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApprovedDiaries; 