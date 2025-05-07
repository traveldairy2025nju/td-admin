import React, { useState } from 'react';
import { 
  Typography, 
  Avatar, 
  Card, 
  Image, 
  Space, 
  Divider, 
  Button, 
  Tag, 
  Alert,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  RobotOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Diary, AiReviewResult } from '../types';
import { formatDate } from '../utils';

const { Title, Text, Paragraph } = Typography;

interface DiaryDetailProps {
  diary: Diary;
  isAdmin?: boolean;
  onDelete?: () => void;
  aiReviewResult?: AiReviewResult | null;
  onApplyAiSuggestion?: () => void;
  onClose?: () => void;
  operationLoading?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onAiReview?: () => void;
  aiReviewLoading?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

const DiaryDetail: React.FC<DiaryDetailProps> = ({
  diary,
  isAdmin = false,
  onDelete,
  aiReviewResult,
  onApplyAiSuggestion,
  onClose,
  operationLoading = false,
  onApprove,
  onReject,
  onAiReview,
  aiReviewLoading = false,
  status = 'approved'
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const handlePreview = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  const renderReviewActions = () => {
    if (status !== 'pending') return null;
    
    return (
      <Card style={{ marginBottom: 24, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>审核操作</Title>
          <Space size="middle">
            {onAiReview && (
              <Tooltip title="使用AI帮助审核此游记">
                <Button
                  type="default"
                  icon={<RobotOutlined />}
                  onClick={onAiReview}
                  loading={aiReviewLoading}
                >
                  AI审核建议
                </Button>
              </Tooltip>
            )}
            {onApprove && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={onApprove}
                loading={operationLoading}
              >
                通过审核
              </Button>
            )}
            {onReject && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={onReject}
                loading={operationLoading}
              >
                拒绝
              </Button>
            )}
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <div className="diary-detail-container">
      {/* 头部区域 */}
      <div className="diary-detail-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>{diary.title}</Title>
          {isAdmin && onDelete && (
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={onDelete}
              loading={operationLoading}
            >
              删除
            </Button>
          )}
        </div>
        
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size="large"
            icon={<UserOutlined />} 
            src={diary.author.avatarUrl} 
            style={{ marginRight: 12 }}
          />
          <div>
            <Text strong style={{ fontSize: 16 }}>
              {diary.author.nickname || diary.author.username}
            </Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                {formatDate(diary.createdAt, 'YYYY-MM-DD HH:mm:ss')}
              </Text>
            </div>
          </div>
        </div>
      </div>
      
      {/* 审核操作区域 */}
      {renderReviewActions()}
      
      {/* 拒绝原因 */}
      {diary.rejectReason && (
        <Card 
          style={{ 
            marginBottom: 24, 
            borderColor: '#ffccc7',
            backgroundColor: '#fff2f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20, marginRight: 12, marginTop: 2 }} />
            <div>
              <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>拒绝原因</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {diary.rejectReason}
              </Paragraph>
            </div>
          </div>
        </Card>
      )}
      
      {/* AI审核建议 */}
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
              {onApplyAiSuggestion && (
                <Space>
                  <Button
                    type="primary"
                    onClick={onApplyAiSuggestion}
                    icon={aiReviewResult.approved ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    应用AI建议
                  </Button>
                </Space>
              )}
            </>
          }
          type={aiReviewResult.approved ? 'success' : 'warning'}
          style={{ marginBottom: 24 }}
        />
      )}
      
      {/* 游记内容 */}
      <Card
        className="diary-content-card"
        style={{ 
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Title level={4} style={{ marginTop: 0 }}>游记内容</Title>
        <div 
          className="diary-content"
          dangerouslySetInnerHTML={{ __html: diary.content }}
          style={{ 
            lineHeight: 1.8,
            fontSize: 16
          }}
        />
      </Card>
      
      {/* 图片展示 */}
      {diary.images && diary.images.length > 0 && (
        <Card
          className="diary-images-card"
          style={{ 
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Title level={4} style={{ marginTop: 0 }}>图片</Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {diary.images.map((image, index) => (
              <div 
                key={index} 
                className="diary-image-item"
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}
                onClick={() => handlePreview(image)}
              >
                <img
                  src={image}
                  alt={`游记图片 ${index + 1}`}
                  style={{ 
                    width: 180, 
                    height: 180, 
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* 视频展示 */}
      {diary.videoUrl && (
        <Card
          className="diary-video-card"
          style={{ 
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Title level={4} style={{ marginTop: 0 }}>视频</Title>
          <div style={{ borderRadius: 8, overflow: 'hidden' }}>
            <video
              controls
              src={diary.videoUrl}
              style={{ width: '100%', maxHeight: 450 }}
            />
          </div>
        </Card>
      )}
      
      {/* 底部操作区域 */}
      {onClose && (
        <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 16 }}>
          <Button size="large" onClick={onClose}>
            关闭
          </Button>
        </div>
      )}
      
      {/* 图片预览 */}
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible: previewVisible,
            onVisibleChange: (vis) => setPreviewVisible(vis),
            current: diary.images?.findIndex(img => img === previewImage) || 0,
          }}
        >
          {diary.images?.map((image, index) => (
            <Image key={index} src={image} />
          ))}
        </Image.PreviewGroup>
      </div>
    </div>
  );
};

export default DiaryDetail; 