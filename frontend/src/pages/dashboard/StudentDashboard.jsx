import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { fetchProfile } from '../../features/profile/profileThunks';
import { getNotices } from '../../features/notices/noticeSlice';

const StudentDashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getNotices({ limit: 10 }));
  }, [dispatch]);

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentDashboard;
