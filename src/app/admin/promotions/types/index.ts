import { PromotionDto } from "@/types/Admin/promotion";

export interface PromotionStatistics {
  totalPromotions: number;
  activePromotions: number;
  pointsPromotions: number;
  featuredPromotions: number;
}

export interface PromotionTableProps {
  promotions: PromotionDto[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  selectedRowKeys: React.Key[];
  onEdit: (record: PromotionDto) => void;
  onView: (record: PromotionDto) => void;
  onDelete: (record: PromotionDto) => void;
  onSelectionChange: (selectedRowKeys: React.Key[], selectedRows: PromotionDto[]) => void;
  onPageChange: (page: number, size: number) => void;
}

export interface PromotionModalProps {
  isVisible: boolean;
  editingPromotion: PromotionDto | null;
  onOk: () => void;
  onCancel: () => void;
  handleSavePromotion: (values: any, editingPromotion: PromotionDto | null) => Promise<boolean>;
  form?: any;
}

export interface PromotionViewModalProps {
  isVisible: boolean;
  promotion: PromotionDto | null;
  onClose: () => void;
  onEdit: (promotion: PromotionDto) => void;
}

export interface PromotionHeaderProps {
  statistics: PromotionStatistics;
  selectedRowKeys: React.Key[];
  onAdd: () => void;
  onExport: () => void;
  onBulkDelete: () => void;
}

export interface PromotionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
} 