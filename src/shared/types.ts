export interface IXmlData {
    fileName: string;
    xmlData: any;
    trimList?: {
        L2: [],
        L8: []
    },
    pageLoading: boolean
}
export interface INotificationData {
    open: boolean;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
}