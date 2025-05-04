import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化日期
 * @param date 日期字符串
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format);
};

/**
 * 获取相对时间
 * @param date 日期字符串
 * @returns 相对时间字符串（如：3天前）
 */
export const getRelativeTime = (date: string): string => {
  return dayjs(date).fromNow();
};

/**
 * 截断文本
 * @param text 文本
 * @param length 最大长度
 * @returns 截断后的文本
 */
export const truncateText = (text: string, length = 100): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
export const copyToClipboard = (text: string): Promise<void> => {
  return navigator.clipboard.writeText(text);
};

/**
 * 从HTML中提取纯文本
 * @param html HTML字符串
 * @returns 纯文本
 */
export const htmlToText = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * 判断文件是否为图片
 * @param filename 文件名
 * @returns 是否为图片
 */
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
};

/**
 * 判断文件是否为视频
 * @param filename 文件名
 * @returns 是否为视频
 */
export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv'].includes(ext);
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖处理后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流处理后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(fn: T, limit: number): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}; 