export type DatasetType = 'Tabular' | 'Image' | 'Text' | 'Audio';

export type DatasetStatus = 'Not Explored' | 'Exploring' | 'Ready for Training' | 'Trained';

export interface Dataset {
  id: number;
  name: string;
  description: string;
  type: DatasetType;
  rows: number;
  features: number;
  status: DatasetStatus;
}

export interface DatasetStats {
  total: number;
  tabular: number;
  image: number;
  text: number;
  audio: number;
}
