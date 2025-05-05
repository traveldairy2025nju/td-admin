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
  Tooltip,
  Alert
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  RobotOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDiaryStore } from '../store/diaryStore';
import { Diary, AiReviewResult } from '../types';
import { formatDate, truncateText, htmlToText } from '../utils';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface PendingDiariesProps {
  isAdmin: boolean;
}

const PendingDiaries: React.FC<PendingDiariesProps> = ({ isAdmin }) => {
  const { 
    pendingDiaries, 
    pendingDiariesLoading, 
    pendingDiariesPagination, 
    pendingDiariesError,
    fetchPendingDiaries,
    approveDiary,
    rejectDiary,
    adminDeleteDiary,
    operationLoading,
    getAiReview,
    aiReviewLoading,
    aiReviewResult,
    aiReviewError
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
  
  const handleAiReview = async (diary: Diary) => {
    try {
      const result = await getAiReview(diary.id);
      setCurrentDiary(diary);
      setViewDrawerVisible(true);
      
      // 如果用户点击"应用AI建议"，自动填写审核结果
      if (result.approved) {
        await approveDiary(diary.id);
        message.success('已应用AI建议：通过审核');
      } else {
        setRejectReason(result.reason);
        setRejectModalVisible(true);
      }
    } catch (error) {
      console.error('AI审核失败:', error);
      message.error('AI审核失败，请稍后重试');
    }
  };
  
  const getActionButtons = (record: Diary) => {
    const buttons = [
      <Button 
        key="view"
        type="primary" 
        size="small" 
        icon={<EyeOutlined />} 
        onClick={() => handleViewDiary(record)}
      >
        查看
      </Button>,
      <Button
        key="ai-review"
        type="default"
        size="small"
        icon={<RobotOutlined />}
        onClick={() => handleAiReview(record)}
        loading={aiReviewLoading}
      >
        AI审核
      </Button>,
      <Button 
        key="approve"
        type="primary" 
        size="small" 
        icon={<CheckCircleOutlined />} 
        onClick={() => handleApproveDiary(record.id)}
        loading={operationLoading}
      >
        通过
      </Button>,
      <Button 
        key="reject"
        danger
        size="small"
        icon={<CloseCircleOutlined />}
        onClick={() => showRejectModal(record)}
        loading={operationLoading}
      >
        拒绝
      </Button>
    ];
    
    // 只有管理员可以删除游记
    if (isAdmin) {
      buttons.push(
        <Button 
          key="delete"
          type="text" 
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => showDeleteModal(record)}
          loading={operationLoading}
        />
      );
    }
    
    return buttons;
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
          {getActionButtons(record)}
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
        title={currentDiary?.title}
        placement="right"
        width={720}
        onClose={() => setViewDrawerVisible(false)}
        open={viewDrawerVisible}
      >
        {currentDiary && (
          <>
            {/* 作者信息 */}
            <div style={{ marginBottom: 24 }}>
              <Space align="center">
                <Avatar 
                  icon={<UserOutlined />} 
                  src={currentDiary.author.avatarUrl} 
                />
                <Text strong>{currentDiary.author.nickname || currentDiary.author.username}</Text>
                <Text type="secondary">
                  提交于 {formatDate(currentDiary.createdAt, 'YYYY-MM-DD HH:mm')}
                </Text>
              </Space>
            </div>
            
            {/* AI审核结果 */}
            {aiReviewResult && (
              <Alert
                message={
                  <Space>
                    <RobotOutlined />
                    <Text strong>AI审核建议</Text>
                  </Space>
                }
                description={
                  <>
                    <Paragraph>
                      <Text type={aiReviewResult.approved ? 'success' : 'danger'}>
                        建议{aiReviewResult.approved ? '通过' : '拒绝'}审核
                      </Text>
                    </Paragraph>
                    <Paragraph>{aiReviewResult.reason}</Paragraph>
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => {
                          if (aiReviewResult.approved) {
                            handleApproveDiary(currentDiary.id);
                          } else {
                            setRejectReason(aiReviewResult.reason);
                            setRejectModalVisible(true);
                          }
                          setViewDrawerVisible(false);
                        }}
                      >
                        应用AI建议
                      </Button>
                    </Space>
                  </>
                }
                type={aiReviewResult.approved ? 'success' : 'warning'}
                style={{ marginBottom: 24 }}
              />
            )}
            
            {/* 游记内容 */}
            <div className="diary-content">
              <Title level={4}>游记内容</Title>
              <div dangerouslySetInnerHTML={{ __html: currentDiary.content }} />
            </div>
            
            {/* 图片展示 */}
            {currentDiary.images && currentDiary.images.length > 0 && (
              <div className="diary-images">
                <Title level={4}>图片</Title>
                <Image.PreviewGroup>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {currentDiary.images.map((url, index) => (
                      <Image
                        key={index}
                        src={url}
                        width={160}
                        height={160}
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}
            
            {/* 视频展示 */}
            {currentDiary.videoUrl && (
              <div className="diary-video">
                <Title level={4}>视频</Title>
                <video
                  src={currentDiary.videoUrl}
                  controls
                  style={{ width: '100%', maxHeight: 400 }}
                />
              </div>
            )}
          </>
        )}
      </Drawer>
      
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

export default PendingDiaries; 