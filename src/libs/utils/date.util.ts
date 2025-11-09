/**
 * 📌 Date Utility Functions
 * - Nằm trong libs để dùng chung toàn dự án
 * - Không phụ thuộc vào domain nào
 */

 export const now = (): Date => {
	return new Date();
  };
  
  /**
   * Format DateTime thành string (YYYY-MM-DD HH:mm:ss)
   */
  export const formatDateTime = (date: Date): string => {
	return date.toISOString().replace('T', ' ').substring(0, 19);
  };
  
  /**
   * Format Date thành string (YYYY-MM-DD)
   */
  export const formatDate = (date: Date): string => {
	return date.toISOString().split('T')[0];
  };
  
  /**
   * Cộng thêm ngày vào một Date
   */
  export const addDays = (date: Date, days: number): Date => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
  };
  
  /**
   * Kiểm tra xem ngày có hợp lệ không
   */
  export const isValidDate = (date: any): boolean => {
	return date instanceof Date && !isNaN(date.getTime());
  };
  