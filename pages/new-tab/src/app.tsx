import { HashRouter, Routes, Route } from 'react-router-dom';

import { Home } from './home';
import { Layout } from './layout';
import { Weekly } from './weekly';

export const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="weekly" element={<Weekly />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};
