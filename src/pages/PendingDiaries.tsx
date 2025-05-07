import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row,
  Col,
  Space, 
  Button, 
  Modal, 
  Typography, 
  Form, 
  Input, 
  Avatar,
  message,
  Empty,
  Spin,
  Tooltip,
  Pagination,
  Tag,
  Input as AntInput
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  SearchOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDiaryStore } from '../store/diaryStore';
import { Diary, AiReviewResult } from '../types';
import { formatDate, truncateText, getRelativeTime } from '../utils';
import DiaryDetail from '../components/DiaryDetail';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Search } = AntInput;

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
    aiReviewResult,
    aiReviewError
  } = useDiaryStore();
  
  const [currentDiary, setCurrentDiary] = useState<Diary | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [aiReviewLoadingMap, setAiReviewLoadingMap] = useState<Record<string, boolean>>({});
  const [keyword, setKeyword] = useState('');
  const [filteredDiaries, setFilteredDiaries] = useState<Diary[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  
  useEffect(() => {
    fetchPendingDiaries();
  }, [fetchPendingDiaries]);
  
  // 监听 pendingDiaries 变化，如果正在过滤则重新应用过滤
  useEffect(() => {
    if (isFiltering && keyword) {
      filterDiaries(keyword);
    } else {
      setFilteredDiaries(pendingDiaries);
    }
  }, [pendingDiaries, isFiltering, keyword]);
  
  const handleViewDiary = (diary: Diary) => {
    setCurrentDiary(diary);
    setViewModalVisible(true);
  };
  
  const handleApproveDiary = async (id: string) => {
    try {
      await approveDiary(id);
      message.success('游记已审核通过');
      setViewModalVisible(false);
      fetchPendingDiaries({
        page: pendingDiariesPagination.page,
        limit: pendingDiariesPagination.limit
      });
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
      setViewModalVisible(false);
      fetchPendingDiaries({
        page: pendingDiariesPagination.page,
        limit: pendingDiariesPagination.limit
      });
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
      setViewModalVisible(false);
      fetchPendingDiaries({
        page: pendingDiariesPagination.page,
        limit: pendingDiariesPagination.limit
      });
    } catch (error) {
      console.error('删除失败:', error);
    }
  };
  
  const handlePaginationChange = (page: number, pageSize?: number) => {
    setIsFiltering(false);
    setKeyword('');
    fetchPendingDiaries({ 
      page, 
      limit: pageSize || pendingDiariesPagination.limit
    });
  };
  
  const handleAiReview = async (diary: Diary) => {
    try {
      setAiReviewLoadingMap(prev => ({ ...prev, [diary.id]: true }));
      await getAiReview(diary.id);
    } catch (error) {
      console.error('AI审核失败:', error);
      message.error('AI审核失败，请稍后重试');
    } finally {
      setAiReviewLoadingMap(prev => ({ ...prev, [diary.id]: false }));
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!currentDiary || !aiReviewResult) return;

    if (aiReviewResult.approved) {
      handleApproveDiary(currentDiary.id);
    } else {
      setRejectReason(aiReviewResult.reason);
      setViewModalVisible(false);
      setRejectModalVisible(true);
    }
  };
  
  // 过滤游记的方法
  const filterDiaries = (searchText: string) => {
    if (!searchText.trim()) {
      setIsFiltering(false);
      setFilteredDiaries(pendingDiaries);
      return;
    }
    
    const lowerKeyword = searchText.toLowerCase();
    const filtered = pendingDiaries.filter(diary => 
      diary.title.toLowerCase().includes(lowerKeyword) || 
      diary.content.toLowerCase().includes(lowerKeyword)
    );
    
    setFilteredDiaries(filtered);
    setIsFiltering(true);
    
    console.log(`搜索关键词 "${searchText}" 找到 ${filtered.length} 条记录`);
    if (filtered.length === 0 && pendingDiaries.length > 0) {
      message.info(`没有找到包含关键词 "${searchText}" 的游记`);
    }
  };

  const handleSearch = () => {
    filterDiaries(keyword);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    
    // 如果清空了关键词，则重置过滤
    if (!value) {
      setIsFiltering(false);
      setFilteredDiaries(pendingDiaries);
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
            <Tag color="warning">待审核</Tag>
          </div>
        </div>
      </Card>
    );
  };
  
  // 显示的游记列表（可能是经过过滤的）
  const diariesToShow = isFiltering ? filteredDiaries : pendingDiaries;
  
  return (
    <div>
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>待审核游记列表</Title>
        <Space>
          <Search
            placeholder="输入关键词搜索游记标题"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            value={keyword}
            onChange={handleInputChange}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>
      </div>
      
      {pendingDiariesError && (
        <div style={{ marginBottom: 16 }}>
          <Text type="danger">{pendingDiariesError}</Text>
        </div>
      )}
      
      {pendingDiariesLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {isFiltering && (
            <div style={{ marginBottom: 16 }}>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>
                    搜索 "{keyword}" 的结果: 找到 {filteredDiaries.length} 条记录
                  </Text>
                  <Button 
                    type="link" 
                    onClick={() => {
                      setIsFiltering(false);
                      setKeyword('');
                    }}
                  >
                    清除过滤
                  </Button>
                </div>
              </Card>
            </div>
          )}
          
          {diariesToShow.length === 0 ? (
            <Card>
              <Empty 
                description={
                  isFiltering 
                    ? `没有找到包含 "${keyword}" 的游记` 
                    : "暂无待审核游记"
                } 
              />
            </Card>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", justifyContent: "flex-start" }}>
                {diariesToShow.map((diary) => (
                  <div key={diary.id} style={{ width: "calc(25% - 12px)", minWidth: "280px", maxWidth: "300px", marginBottom: "16px" }}>
                    {renderDiaryCard(diary)}
                  </div>
                ))}
              </div>
              
              {!isFiltering && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Pagination
                    current={pendingDiariesPagination.page}
                    pageSize={pendingDiariesPagination.limit}
                    total={pendingDiariesPagination.total}
                    onChange={handlePaginationChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 条记录`}
                  />
                </div>
              )}
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
            aiReviewResult={aiReviewResult}
            onApplyAiSuggestion={handleApplyAiSuggestion}
            operationLoading={operationLoading}
            onApprove={() => handleApproveDiary(currentDiary.id)}
            onReject={() => {
              setViewModalVisible(false);
              showRejectModal(currentDiary);
            }}
            onAiReview={() => handleAiReview(currentDiary)}
            aiReviewLoading={aiReviewLoadingMap[currentDiary.id]}
            status="pending"
          />
        )}
      </Modal>
      
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