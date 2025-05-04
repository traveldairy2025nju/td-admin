import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Space, 
  Button, 
  Tag, 
  Modal, 
  Typography, 
  Drawer, 
  Form, 
  Input, 
  Avatar,
  message,
  Image,
  Empty,
  Spin,
  Tooltip
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDiaryStore } from '../store/diaryStore';
import { Diary } from '../types';
import { formatDate, truncateText, htmlToText } from '../utils';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PendingDiaries: React.FC = () => {
  const { 
    pendingDiaries, 
    pendingDiariesLoading, 
    pendingDiariesPagination, 
    pendingDiariesError,
    fetchPendingDiaries,
    approveDiary,
    rejectDiary,
    adminDeleteDiary,
    operationLoading
  } = useDiaryStore();
  
  const [currentDiary, setCurrentDiary] = useState<Diary | null>(null);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPendingDiaries();
  }, [fetchPendingDiaries]);
  
  const handleViewDiary = (diary: Diary) => {
    setCurrentDiary(diary);
    setViewDrawerVisible(true);
  };
  
  const handleApproveDiary = async (id: string) => {
    try {
      await approveDiary(id);
      message.success('游记已审核通过');
    } catch (error) {
      console.error('审核失败:', error);
    }
  };
  
  const showRejectModal = (diary: Diary) => {
    setCurrentDiary(diary);
    setRejectModalVisible(true);
  };
  
  const handleRejectDiary = async () => {
    if (!currentDiary) return;
    
    if (!rejectReason.trim()) {
      message.error('请提供拒绝原因');
      return;
    }
    
    try {
      await rejectDiary(currentDiary.id, { rejectReason });
      setRejectModalVisible(false);
      setRejectReason('');
      message.success('游记已拒绝');
    } catch (error) {
      console.error('拒绝失败:', error);
    }
  };
  
  const showDeleteModal = (diary: Diary) => {
    setCurrentDiary(diary);
    setDeleteModalVisible(true);
  };
  
  const handleDeleteDiary = async () => {
    if (!currentDiary) return;
    
    try {
      await adminDeleteDiary(currentDiary.id);
      setDeleteModalVisible(false);
      message.success('游记已删除');
    } catch (error) {
      console.error('删除失败:', error);
    }
  };
  
  const handleTableChange = (pagination: any) => {
    fetchPendingDiaries({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };
  
  const columns: ColumnsType<Diary> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{truncateText(text, 20)}</span>
        </Tooltip>
      ),
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
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {formatDate(date, 'YYYY-MM-DD HH:mm')}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDiary(record)}
          >
            查看
          </Button>
          <Button 
            type="primary" 
            size="small" 
            icon={<CheckCircleOutlined />} 
            onClick={() => handleApproveDiary(record.id)}
            loading={operationLoading}
          >
            通过
          </Button>
          <Button 
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => showRejectModal(record)}
            loading={operationLoading}
          >
            拒绝
          </Button>
          <Button 
            type="text" 
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal(record)}
            loading={operationLoading}
          />
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <div className="content-header">
        <Title level={3}>待审核游记列表</Title>
      </div>
      
      {pendingDiariesError && (
        <div style={{ marginBottom: 16 }}>
          <Text type="danger">{pendingDiariesError}</Text>
        </div>
      )}
      
      <Card>
        <Table
          columns={columns}
          dataSource={pendingDiaries}
          rowKey="id"
          loading={pendingDiariesLoading}
          pagination={{
            current: pendingDiariesPagination.page,
            pageSize: pendingDiariesPagination.limit,
            total: pendingDiariesPagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: <Empty description="暂无待审核游记" />,
          }}
        />
      </Card>
      
      {/* 查看游记抽屉 */}
      <Drawer
        title="游记详情"
        width={720}
        open={viewDrawerVisible}
        onClose={() => setViewDrawerVisible(false)}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={() => {
                if (currentDiary) {
                  handleApproveDiary(currentDiary.id);
                  setViewDrawerVisible(false);
                }
              }}
              loading={operationLoading}
            >
              通过
            </Button>
            <Button 
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setViewDrawerVisible(false);
                if (currentDiary) {
                  showRejectModal(currentDiary);
                }
              }}
              loading={operationLoading}
            >
              拒绝
            </Button>
          </Space>
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
      
      {/* 拒绝游记模态框 */}
      <Modal
        title="拒绝游记"
        open={rejectModalVisible}
        onOk={handleRejectDiary}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={operationLoading}
        okText="确认拒绝"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>您即将拒绝以下游记：</Text>
          <Paragraph strong style={{ margin: '8px 0' }}>
            {currentDiary?.title}
          </Paragraph>
        </div>
        
        <Form layout="vertical">
          <Form.Item
            label="拒绝原因"
            required
            rules={[{ required: true, message: '请输入拒绝原因' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入拒绝原因，作者将会收到您的反馈"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 删除游记模态框 */}
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
    </div>
  );
};

export default PendingDiaries; 