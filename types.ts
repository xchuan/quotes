export interface IImg {
  url: string;
  previewUrl: string;
  date: string;
  copyright: string;
}

export interface IArticle {
  article: string;
  author: {
    display_name: string;
    uri: string;
  };
  content: string;
  content_text: string;
  title: string;
  uri: string;
  display_time: number;
}

export interface IResponse {
  code: number;
  data: {
    items:IArticle[],
    next_cursor:string
    op_cursor:string
    polling_cursor:string
  };
  message: string;
}
