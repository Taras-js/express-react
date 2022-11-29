import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/antd.variable.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import { SWRConfig } from 'swr';
import { ConfigProvider } from 'antd';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const primaryColor = '#4f67ff';

const config: any = {
  theme: {
    primaryColor,
  },
};
ConfigProvider.config(config);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <SWRConfig value={{ fetcher }}>
      <Router>
        <App />
      </Router>
    </SWRConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
