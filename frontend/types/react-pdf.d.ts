declare module "react-pdf" {
  import * as React from "react";

  export const pdfjs: {
    version: string;
    GlobalWorkerOptions: {
      workerSrc: string;
    };
  };

  export const Document: React.ComponentType<any>;
  export const Page: React.ComponentType<any>;
}
