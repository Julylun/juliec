import React from 'react';

import MenuButton from '../components/ui/MenuButton';

const Home = () => {
  return (
    <div className='w-full h-full'>
      <div className='w-full h-1/3'>
        <h1>JULIEC</h1>
      </div>
      <div>
        <MenuButton name={"Button"} _function={() => { console.log('Button Clicked') }} />
      </div>
    </div>
  );
};

export default Home;
