/**
 * Sổ chiến lược — thứ thay thế hệ điểm 0–100.
 *
 * Cố ý chỉ có năm mục: trẻ phải giữ được cả cuốn sổ trong đầu, và mỗi mục phải là việc trẻ
 * LÀM ĐƯỢC ngoài đời, không phải một phẩm chất trẻ có hoặc không có.
 *
 * Không có "chiến lược tiêu cực", không trọng số, không tổng. Một lựa chọn hoặc thể hiện một
 * chiến lược, hoặc không — để trống là câu trả lời hợp lệ.
 */

export const STRATEGIES = [
  {
    code: 'nhan_biet_cam_xuc',
    name: 'Nhận biết cảm xúc',
    icon: 'smile',
    description: 'Gọi tên điều mình đang cảm thấy trước khi làm gì tiếp.',
    promptForChild: 'Có tình huống giúp con thử gọi tên cảm xúc của mình.',
  },
  {
    code: 'noi_ro_nhu_cau',
    name: 'Nói rõ nhu cầu',
    icon: 'megaphone',
    description: 'Nói ra điều mình muốn hoặc không muốn, rõ ràng và tử tế.',
    promptForChild: 'Có tình huống giúp con thử nói thẳng điều mình cần.',
  },
  {
    code: 'nho_giup_do',
    name: 'Nhờ giúp đỡ',
    icon: 'handHeart',
    description: 'Tìm người lớn hoặc bạn tin được khi việc quá sức mình.',
    promptForChild: 'Có tình huống giúp con thử nhờ người khác giúp.',
  },
  {
    code: 'ton_trong_ranh_gioi',
    name: 'Tôn trọng ranh giới',
    icon: 'shieldCheck',
    description: 'Nhận ra giới hạn của mình và của người khác, rồi giữ lấy.',
    promptForChild: 'Có tình huống giúp con thử giữ ranh giới của mình.',
  },
  {
    code: 'xem_xet_hau_qua',
    name: 'Xem xét hậu quả',
    icon: 'gitBranch',
    description: 'Dừng một nhịp để nghĩ điều gì sẽ xảy ra sau đó.',
    promptForChild: 'Có tình huống giúp con thử nghĩ trước một bước.',
  },
];

export const STRATEGY_BY_CODE = Object.fromEntries(STRATEGIES.map((s) => [s.code, s]));

export function strategyName(code) {
  return STRATEGY_BY_CODE[code]?.name || '';
}
