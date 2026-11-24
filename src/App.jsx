import React, { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'sms_csd_prototype_v2';
const COLLEGE_DOMAIN = 'example.edu';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17]; // 10 AM to 6 PM (13 = 1–2 PM Lunch)

const formatHour = (h) => {
  if (h === 12) return '12:00 PM';
  if (h > 12) return `${h - 12}:00 PM`;
  return `${h}:00 AM`;
};

const formatRange = (startHour, duration) =>
  `${formatHour(startHour)} – ${formatHour(startHour + duration)}`;

const formatColumnHeader = (h) => {
  if (h === 10) return '10–11 AM';
  if (h === 11) return '11 AM–12 PM';
  if (h === 12) return '12–1 PM';
  if (h === 13) return '1–2 PM';
  return `${h - 12}–${h - 11} PM`;
};

const INITIAL_USERS = [
  {
    id: 1,
    name: 'Shivansh Gupta',
    email: 'student@example.edu',
    password: 'Student@123',
    role: 'student',
    department: 'CSD',
    branch: 'Computer Science & Design (CSD)',
    semester: '1st Semester',
    subject: null,
  },
  {
    id: 2,
    name: 'Arti Ahirwar',
    email: 'teacher@example.edu',
    password: 'Teacher@123',
    role: 'teacher',
    department: 'CSD',
    branch: 'CSD',
    semester: null,
    subject: 'Micro Project Lab (29261109)',
  },
  {
    id: 3,
    name: 'Mahesh Parmar',
    email: 'hod@example.edu',
    password: 'HOD@123',
    role: 'admin',
    department: 'CSD',
    branch: 'CSD',
    semester: null,
    subject: 'Head of Department (CSD)',
  },
];

const SUBJECTS = [
  { code: '29261101', name: 'Visual Design and Graphics', teacher: 'Dr. Manojeet Roy', duration: 1, type: 'Class', defaultRoom: 'ROOM-004' },
  { code: '29261102', name: 'Computer Programming', teacher: 'Dr. Devesh Kumar Lal', duration: 1, type: 'Class', defaultRoom: 'ROOM-004' },
  { code: '29261103', name: 'Digital Circuit Design', teacher: 'Dr. Saurabh Agarawal', duration: 1, type: 'Class', defaultRoom: 'ROOM-004' },
  { code: '29261104', name: 'Cyber World and Security Concern', teacher: 'Manisha Pathak', duration: 1, type: 'Class', defaultRoom: 'ROOM-004' },
  { code: '29261105', name: 'Linear Algebra', teacher: 'Divya Pundhir', duration: 1, type: 'Class', defaultRoom: 'ROOM-004' },
  { code: '29261106', name: 'Computer Programming Lab', teacher: 'Dr. Praphula Kumar Jain', duration: 2, type: 'Lab', defaultRoom: 'LAB PL1' },
  { code: '29261107', name: 'Visual Design Graphics Lab', teacher: 'Dr. Kuldeep Narayan Tripathi', duration: 2, type: 'Lab', defaultRoom: 'LAB PL5' },
  { code: '29261108', name: 'Semester Proficiency', teacher: 'Jaimala Jha', duration: 2, type: 'Class', defaultRoom: 'ROOM-004' },
  { code: '29261109', name: 'Micro Project', teacher: 'Arti Ahirwar', duration: 2, type: 'Lab', defaultRoom: 'LAB PL2' },
  { code: '29261110', name: 'Language Lab', teacher: 'Dr. Arzoo Choubey', duration: 2, type: 'Lab', defaultRoom: 'HALL SH01' },
];

const SUBJECT_MAP = Object.fromEntries(SUBJECTS.map((s) => [s.code, s]));

const INITIAL_ROOMS = [
  { id: 'ROOM-004', name: 'ROOM-004', type: 'Classroom', capacity: 65, block: 'CSD Block' },
  { id: 'LAB PL1', name: 'LAB PL1', type: 'Computer Lab', capacity: 40, block: 'Programming Wing' },
  { id: 'LAB PL2', name: 'LAB PL2', type: 'Project Lab', capacity: 40, block: 'Programming Wing' },
  { id: 'LAB PL5', name: 'LAB PL5', type: 'Graphics Lab', capacity: 40, block: 'Design Wing' },
  { id: 'HALL SH01', name: 'HALL SH01', type: 'Language Hall', capacity: 70, block: 'Main Block' },
  { id: 'ROOM-005', name: 'ROOM-005', type: 'Spare Classroom', capacity: 60, block: 'CSD Block' },
];

const makeEntry = (id, day, startHour, code, isExtraClass = false) => {
  const s = SUBJECT_MAP[code];
  return {
    id,
    day,
    startHour,
    duration: s.duration,
    subjectCode: s.code,
    subjectName: s.name,
    teacher: s.teacher,
    room: s.defaultRoom,
    type: s.type,
    isExtraClass,
    rescheduled: false,
    note: '',
  };
};

const INITIAL_SCHEDULE = [
  makeEntry('sch-1', 'Monday', 14, '29261108'),
  makeEntry('sch-2', 'Monday', 16, '29261109'),
  makeEntry('sch-3', 'Tuesday', 10, '29261104'),
  makeEntry('sch-4', 'Tuesday', 11, '29261107'),
  makeEntry('sch-5', 'Tuesday', 14, '29261103'),
  makeEntry('sch-6', 'Wednesday', 10, '29261101'),
  makeEntry('sch-7', 'Wednesday', 11, '29261105'),
  makeEntry('sch-8', 'Wednesday', 12, '29261103'),
  makeEntry('sch-9', 'Wednesday', 14, '29261110'),
  makeEntry('sch-10', 'Wednesday', 16, '29261106'),
  makeEntry('sch-11', 'Thursday', 11, '29261105'),
  makeEntry('sch-12', 'Thursday', 12, '29261103'),
  makeEntry('sch-13', 'Thursday', 14, '29261102'),
  makeEntry('sch-14', 'Thursday', 15, '29261101'),
  makeEntry('sch-15', 'Thursday', 16, '29261104'),
  makeEntry('sch-16', 'Friday', 10, '29261104'),
  makeEntry('sch-17', 'Friday', 11, '29261102'),
  makeEntry('sch-18', 'Friday', 12, '29261101'),
  makeEntry('sch-19', 'Friday', 14, '29261105'),
];

const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    studentName: 'Shivansh Gupta',
    studentEmail: 'student@example.edu',
    branch: 'CSD — 1st Semester',
    room: 'LAB PL2',
    day: 'Tuesday',
    startHour: 15,
    duration: 2,
    purpose: 'Micro Project prototype testing and group discussion',
    status: 'Pending',
    hodReason: '',
    createdAt: 'Today, 10:15 AM',
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'not-1',
    targetRole: 'all',
    title: 'CSD 1st Semester Timetable Active',
    message: 'College hours are 10:00 AM – 6:00 PM with Lunch Break from 1:00 PM – 2:00 PM. Saturday is a holiday unless an extra class is scheduled.',
    time: 'Today, 09:00 AM',
    read: false,
  },
  {
    id: 'not-2',
    targetRole: 'admin',
    title: 'New Lab Booking Request',
    message: 'Shivansh Gupta requested LAB PL2 on Tuesday (3:00 PM – 5:00 PM) for Micro Project work.',
    time: 'Today, 10:15 AM',
    read: false,
  },
];

const defaultData = () => ({
  users: INITIAL_USERS,
  rooms: INITIAL_ROOMS,
  schedule: INITIAL_SCHEDULE,
  requests: INITIAL_REQUESTS,
  notifications: INITIAL_NOTIFICATIONS,
});

const loadStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    return { ...defaultData(), ...parsed };
  } catch {
    return defaultData();
  }
};

const roleHome = (role) => {
  if (role === 'student') return '/student/dashboard';
  if (role === 'teacher') return '/teacher/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/login';
};

const ROUTE_PERMISSIONS = {
  '/login': 'public',
  '/forgot-password': 'public',
  '/student/dashboard': ['student'],
  '/student/schedule': ['student'],
  '/student/requests/new': ['student'],
  '/student/requests': ['student'],
  '/teacher/dashboard': ['teacher'],
  '/teacher/schedules/create': ['teacher'],
  '/teacher/schedules/manage': ['teacher'],
  '/teacher/rooms': ['teacher'],
  '/admin/dashboard': ['admin'],
  '/admin/requests': ['admin'],
  '/admin/schedules': ['admin'],
  '/admin/manage': ['admin'],
  '/notifications': ['student', 'teacher', 'admin'],
  '/profile': ['student', 'teacher', 'admin'],
  '/403': ['student', 'teacher', 'admin'],
  '/404': 'any',
};

const getTodayName = () => {
  const idx = new Date().getDay();
  if (idx === 0) return 'Monday';
  return DAYS[idx - 1];
};

const overlaps = (startA, durA, startB, durB) =>
  startA < startB + durB && startB < startA + durA;

const LogoIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2.5" strokeWidth="2" />
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
    <circle cx="8" cy="14.5" r="1" fill="currentColor" />
    <circle cx="12" cy="14.5" r="1" fill="currentColor" />
    <circle cx="16" cy="14.5" r="1" fill="currentColor" />
    <circle cx="8" cy="18" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function TimetableView({ schedule, highlightTeacher = null, title = 'CSD 1st Semester Weekly Timetable' }) {
  const [selectedDay, setSelectedDay] = useState(getTodayName());
  const [viewMode, setViewMode] = useState('weekly');

  const getSlotAt = (day, hour) =>
    schedule.find((item) => item.day === day && hour >= item.startHour && hour < item.startHour + item.duration);

  const dayEntries = schedule
    .filter((item) => item.day === selectedDay)
    .sort((a, b) => a.startHour - b.startHour);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            10:00 AM – 6:00 PM • Lunch Break: 1:00 PM – 2:00 PM • Saturday: Holiday (Extra classes only)
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'weekly' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'daily' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Day View (Mobile)
          </button>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {day}
                {day === 'Saturday' && ' (Holiday)'}
              </button>
            ))}
          </div>

          {selectedDay === 'Saturday' && dayEntries.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <p className="font-bold text-emerald-900">Saturday — Holiday</p>
              <p className="text-xs text-emerald-700 mt-1">
                No regular classes are scheduled on Saturdays. Only extra classes added by Faculty or HOD appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {HOURS.map((hour) => {
                if (hour === 13) {
                  return (
                    <div
                      key={hour}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200"
                    >
                      <span className="text-xs font-bold text-amber-800">{formatRange(13, 1)}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Lunch Break</span>
                    </div>
                  );
                }
                const entry = getSlotAt(selectedDay, hour);
                if (entry && entry.startHour !== hour) return null;
                if (!entry) {
                  return (
                    <div
                      key={hour}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200"
                    >
                      <span className="text-xs font-medium text-slate-500">{formatRange(hour, 1)}</span>
                      <span className="text-xs font-medium text-slate-400">Free Time</span>
                    </div>
                  );
                }
                const isMine = highlightTeacher && entry.teacher === highlightTeacher;
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border ${
                      entry.type === 'Lab'
                        ? 'bg-indigo-50/70 border-indigo-200'
                        : 'bg-blue-50/60 border-blue-200'
                    } ${isMine ? 'ring-2 ring-blue-600' : ''}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        {formatRange(entry.startHour, entry.duration)} ({entry.duration} hr)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-white border border-slate-200 text-slate-700">
                          {entry.room}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-900 text-white">
                          {entry.subjectCode}
                        </span>
                        {entry.rescheduled && (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-500 text-white">
                            Rescheduled
                          </span>
                        )}
                        {entry.isExtraClass && (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-600 text-white">
                            Extra Class
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-slate-900 mt-1.5 text-sm">{entry.subjectName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">Faculty: {entry.teacher}</p>
                    {entry.note && <p className="text-xs text-amber-700 mt-1">Note: {entry.note}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-600 w-28 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  Day
                </th>
                {HOURS.map((hour) => (
                  <th
                    key={hour}
                    className={`p-3 text-[11px] font-bold uppercase tracking-wider text-center border-r border-slate-200 ${
                      hour === 13 ? 'bg-amber-50 text-amber-800 w-24' : 'text-slate-600'
                    }`}
                  >
                    <div>{formatColumnHeader(hour)}</div>
                    {hour === 13 && <div className="text-[10px] font-extrabold">Lunch</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const satClasses = schedule.filter((s) => s.day === 'Saturday');
                if (day === 'Saturday' && satClasses.length === 0) {
                  return (
                    <tr key={day} className="border-b border-slate-200 bg-emerald-50/40">
                      <td className="p-3 text-xs font-bold text-slate-800 sticky left-0 bg-emerald-50 border-r border-slate-200">
                        Saturday
                      </td>
                      <td colSpan={HOURS.length} className="p-3 text-center text-xs font-semibold text-emerald-800">
                        Holiday — No regular classes scheduled (Extra classes can be scheduled by Faculty / HOD)
                      </td>
                    </tr>
                  );
                }

                const cells = [];
                for (let i = 0; i < HOURS.length; i++) {
                  const hour = HOURS[i];
                  if (hour === 13) {
                    cells.push(
                      <td
                        key={`${day}-lunch`}
                        className="p-2 text-center bg-amber-50/80 border-r border-slate-200 text-[11px] font-bold text-amber-800"
                      >
                        LUNCH
                      </td>
                    );
                    continue;
                  }

                  const entry = getSlotAt(day, hour);
                  if (entry && entry.startHour === hour) {
                    const span = entry.duration;
                    const isMine = highlightTeacher && entry.teacher === highlightTeacher;
                    cells.push(
                      <td
                        key={entry.id}
                        colSpan={span}
                        className="p-1.5 border-r border-slate-200 align-top"
                      >
                        <div
                          className={`h-full p-2.5 rounded-xl border text-xs ${
                            entry.type === 'Lab'
                              ? 'bg-indigo-50 border-indigo-200'
                              : 'bg-blue-50 border-blue-200'
                          } ${isMine ? 'ring-2 ring-blue-600' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-extrabold text-[10px] text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {entry.subjectCode}
                            </span>
                            <span className="font-bold text-[10px] text-blue-700">
                              {entry.room}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 leading-snug">{entry.subjectName}</p>
                          <p className="text-[11px] text-slate-600 mt-1">{entry.teacher}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 text-slate-600 font-medium">
                              {entry.duration}h {entry.type}
                            </span>
                            {entry.rescheduled && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                                Updated
                              </span>
                            )}
                            {entry.isExtraClass && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                                Extra
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                    i += span - 1;
                  } else if (!entry) {
                    cells.push(
                      <td
                        key={`${day}-${hour}`}
                        className="p-2 text-center border-r border-slate-200 text-[11px] text-slate-400 bg-slate-50/40"
                      >
                        Free Time
                      </td>
                    );
                  }
                }

                return (
                  <tr key={day} className="border-b border-slate-200 hover:bg-slate-50/40">
                    <td className="p-3 text-xs font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200">
                      {day}
                    </td>
                    {cells}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [store, setStore] = useState(loadStore);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('sms_active_user_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [navState, setNavState] = useState(() => {
    const startPath = currentUser ? roleHome(currentUser.role) : '/login';
    return { stack: [startPath], index: 0 };
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const currentPath = navState.stack[navState.index] || '/login';
  const canGoBack = navState.index > 0;
  const canGoForward = navState.index < navState.stack.length - 1;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('sms_active_user_v2', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('sms_active_user_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    const onPopState = (e) => {
      if (e.state && typeof e.state.idx === 'number') {
        setNavState((prev) => ({
          ...prev,
          index: Math.max(0, Math.min(e.state.idx, prev.stack.length - 1)),
        }));
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const navigate = (path) => {
    setMobileMenuOpen(false);
    if (path === currentPath) return;
    setNavState((prev) => {
      const nextStack = prev.stack.slice(0, prev.index + 1);
      nextStack.push(path);
      const nextIdx = nextStack.length - 1;
      try {
        window.history.pushState({ idx: nextIdx, path }, '', `#${path}`);
      } catch {}
      return { stack: nextStack, index: nextIdx };
    });
  };

  const goBack = () => {
    if (!canGoBack) return;
    setMobileMenuOpen(false);
    setNavState((prev) => ({ ...prev, index: prev.index - 1 }));
  };

  const goForward = () => {
    if (!canGoForward) return;
    setMobileMenuOpen(false);
    setNavState((prev) => ({ ...prev, index: prev.index + 1 }));
  };

  const addNotification = (targetRole, title, message) => {
    const newNotif = {
      id: `not-${Date.now()}`,
      targetRole,
      title,
      message,
      time: 'Just now',
      read: false,
    };
    setStore((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const home = roleHome(user.role);
    setNavState({ stack: [home], index: 0 });
    showToast(`Signed in as ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNavState({ stack: ['/login'], index: 0 });
    showToast('Logged out successfully.');
  };

  const resetDemoData = () => {
    const fresh = defaultData();
    setStore(fresh);
    showToast('Prototype timetable & accounts reset to default CSD 1st Sem data.');
  };

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return store.notifications.filter(
      (n) => n.targetRole === 'all' || n.targetRole === currentUser.role
    );
  }, [store.notifications, currentUser]);

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const renderPage = () => {
    if (currentPath === '/login') {
      return (
        <LoginPage
          users={store.users}
          onLogin={handleLoginSuccess}
          onForgot={() => navigate('/forgot-password')}
        />
      );
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage onBack={() => navigate('/login')} />;
    }
    if (!currentUser) {
      return (
        <LoginPage
          users={store.users}
          onLogin={handleLoginSuccess}
          onForgot={() => navigate('/forgot-password')}
        />
      );
    }

    const allowed = ROUTE_PERMISSIONS[currentPath];
    if (!allowed) {
      return <ErrorPage code="404" title="Page Not Found" navigate={navigate} role={currentUser.role} />;
    }
    if (Array.isArray(allowed) && !allowed.includes(currentUser.role)) {
      return <ErrorPage code="403" title="Access Restricted (RBAC)" navigate={navigate} role={currentUser.role} />;
    }

    switch (currentPath) {
      case '/student/dashboard':
        return (
          <StudentDashboard
            user={currentUser}
            schedule={store.schedule}
            requests={store.requests}
            notifications={userNotifications}
            navigate={navigate}
          />
        );
      case '/student/schedule':
        return <TimetableView schedule={store.schedule} title="My Personal Class Schedule — CSD 1st Sem" />;
      case '/student/requests/new':
        return (
          <StudentNewRequestPage
            user={currentUser}
            rooms={store.rooms}
            schedule={store.schedule}
            onSubmit={(req) => {
              setStore((prev) => ({ ...prev, requests: [req, ...prev.requests] }));
              addNotification(
                'admin',
                'New Room Request',
                `${req.studentName} requested ${req.room} on ${req.day} (${formatRange(req.startHour, req.duration)}).`
              );
              showToast('Room/Lab request submitted for HOD review.');
              navigate('/student/requests');
            }}
          />
        );
      case '/student/requests':
        return (
          <StudentMyRequestsPage
            requests={store.requests.filter((r) => r.studentEmail === currentUser.email)}
            navigate={navigate}
          />
        );
      case '/teacher/dashboard':
        return (
          <FacultyDashboard
            user={currentUser}
            schedule={store.schedule}
            rooms={store.rooms}
            navigate={navigate}
          />
        );
      case '/teacher/schedules/create':
        return (
          <FacultyCreateSchedulePage
            rooms={store.rooms}
            schedule={store.schedule}
            onAdd={(entry) => {
              setStore((prev) => ({ ...prev, schedule: [...prev.schedule, entry] }));
              addNotification(
                'all',
                entry.isExtraClass ? 'Saturday Extra Class Added' : 'New Class Scheduled',
                `${entry.subjectCode} ${entry.subjectName} (${entry.teacher}) on ${entry.day} ${formatRange(entry.startHour, entry.duration)} in ${entry.room}.`
              );
              showToast('Schedule updated and students notified.');
              navigate('/teacher/schedules/manage');
            }}
          />
        );
      case '/teacher/schedules/manage':
        return (
          <FacultyManageSchedulePage
            schedule={store.schedule}
            rooms={store.rooms}
            onUpdate={(updated) => {
              setStore((prev) => ({
                ...prev,
                schedule: prev.schedule.map((s) => (s.id === updated.id ? updated : s)),
              }));
              addNotification(
                'all',
                'Class Rescheduled / Room Updated',
                `${updated.subjectName} moved to ${updated.day} ${formatRange(updated.startHour, updated.duration)} in ${updated.room}.${updated.note ? ` (${updated.note})` : ''}`
              );
              showToast('Class rescheduled and notification sent.');
            }}
            onDelete={(id) => {
              const target = store.schedule.find((s) => s.id === id);
              setStore((prev) => ({ ...prev, schedule: prev.schedule.filter((s) => s.id !== id) }));
              if (target) {
                addNotification('all', 'Class Cancelled', `${target.subjectName} on ${target.day} (${formatRange(target.startHour, target.duration)}) was removed.`);
              }
              showToast('Class slot removed.');
            }}
          />
        );
      case '/teacher/rooms':
        return <RoomAvailabilityPage rooms={store.rooms} schedule={store.schedule} />;
      case '/admin/dashboard':
        return (
          <HodDashboard
            user={currentUser}
            schedule={store.schedule}
            requests={store.requests}
            rooms={store.rooms}
            users={store.users}
            navigate={navigate}
          />
        );
      case '/admin/requests':
        return (
          <HodRequestsPage
            requests={store.requests}
            onDecision={(id, status, reason) => {
              const target = store.requests.find((r) => r.id === id);
              setStore((prev) => ({
                ...prev,
                requests: prev.requests.map((r) =>
                  r.id === id ? { ...r, status, hodReason: reason } : r
                ),
              }));
              if (target) {
                addNotification(
                  'student',
                  `Room Request ${status}`,
                  `HOD Mahesh Parmar ${status.toLowerCase()} your request for ${target.room} on ${target.day}.${reason ? ` Reason: ${reason}` : ''}`
                );
              }
              showToast(`Request marked as ${status}.`);
            }}
          />
        );
      case '/admin/schedules':
        return (
          <HodMasterSchedulePage
            schedule={store.schedule}
            rooms={store.rooms}
            onReset={resetDemoData}
          />
        );
      case '/admin/manage':
        return (
          <HodManagePage
            rooms={store.rooms}
            users={store.users}
            onAddRoom={(room) => {
              if (store.rooms.some((r) => r.id === room.id)) {
                showToast(`Room ${room.id} already exists.`, 'error');
                return;
              }
              setStore((prev) => ({ ...prev, rooms: [...prev.rooms, room] }));
              showToast(`Added ${room.name}.`);
            }}
            onDeleteRoom={(id) => {
              setStore((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r.id !== id) }));
              showToast(`Removed ${id}.`);
            }}
            onReset={resetDemoData}
          />
        );
      case '/notifications':
        return (
          <NotificationsPage
            notifications={userNotifications}
            onMarkAllRead={() => {
              setStore((prev) => ({
                ...prev,
                notifications: prev.notifications.map((n) =>
                  n.targetRole === 'all' || n.targetRole === currentUser.role
                    ? { ...n, read: true }
                    : n
                ),
              }));
              showToast('All notifications marked as read.');
            }}
          />
        );
      case '/profile':
        return <ProfilePage user={currentUser} onReset={resetDemoData} />;
      case '/403':
        return <ErrorPage code="403" title="Access Restricted (RBAC)" navigate={navigate} role={currentUser.role} />;
      default:
        return <ErrorPage code="404" title="Page Not Found" navigate={navigate} role={currentUser.role} />;
    }
  };

  if (!currentUser || currentPath === '/login' || currentPath === '/forgot-password') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {toast && (
          <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg">
            {toast.msg}
          </div>
        )}
        {renderPage()}
      </div>
    );
  }

  const navLinks =
    currentUser.role === 'student'
      ? [
          { label: 'Dashboard', path: '/student/dashboard' },
          { label: 'Personal Schedule', path: '/student/schedule' },
          { label: 'Request Room / Lab', path: '/student/requests/new' },
          { label: 'My Requests', path: '/student/requests' },
          { label: 'Notifications', path: '/notifications', badge: unreadCount },
          { label: 'Profile & Directory', path: '/profile' },
        ]
      : currentUser.role === 'teacher'
      ? [
          { label: 'Faculty Dashboard', path: '/teacher/dashboard' },
          { label: 'Create / Extra Class', path: '/teacher/schedules/create' },
          { label: 'Reschedule & Swap', path: '/teacher/schedules/manage' },
          { label: 'Room Availability', path: '/teacher/rooms' },
          { label: 'Notifications', path: '/notifications', badge: unreadCount },
          { label: 'Profile & Directory', path: '/profile' },
        ]
      : [
          { label: 'HOD Dashboard', path: '/admin/dashboard' },
          {
            label: 'Request Approvals',
            path: '/admin/requests',
            badge: store.requests.filter((r) => r.status === 'Pending').length,
          },
          { label: 'Master Schedule', path: '/admin/schedules' },
          { label: 'Rooms & Users', path: '/admin/manage' },
          { label: 'Notifications', path: '/notifications', badge: unreadCount },
          { label: 'Profile & Directory', path: '/profile' },
        ];

  const roleBadgeColor =
    currentUser.role === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : currentUser.role === 'teacher'
      ? 'bg-indigo-100 text-indigo-800'
      : 'bg-blue-100 text-blue-800';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0 z-20">
        <div className="p-5 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <LogoIcon />
          </div>
          <div>
            <p className="font-black text-slate-900 leading-none">SMS</p>
            <p className="text-[11px] font-semibold text-blue-600 mt-0.5">CSD Schedule System</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const active = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      active ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${roleBadgeColor}`}>
              {currentUser.role === 'admin' ? 'HOD — CSD' : `${currentUser.role} — CSD`}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            Logout / Switch Account
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-[82vw] bg-white h-full shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <LogoIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-sm">SMS</p>
                  <p className="text-[10px] font-semibold text-blue-600">CSD Dept Prototype</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                <CloseIcon />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navLinks.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                    currentPath === item.path ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500 mb-3">{currentUser.email}</p>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50"
              >
                Logout / Switch Role
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={goBack}
                disabled={!canGoBack}
                title="Go Back"
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition"
              >
                <ArrowLeftIcon />
              </button>
              <button
                onClick={goForward}
                disabled={!canGoForward}
                title="Go Forward"
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition"
              >
                <ArrowRightIcon />
              </button>
            </div>

            <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {currentPath}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/notifications')}
              className="relative px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Alerts
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
            >
              <span>{currentUser.name}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {renderPage()}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl max-w-sm">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function LoginPage({ users, onLogin, onForgot }) {
  const [selectedType, setSelectedType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(trimmed)) {
      setError('Please enter a valid college email ID.');
      return;
    }
    if (!trimmed.endsWith(`@${COLLEGE_DOMAIN}`)) {
      setError(`Email must belong to the college domain (@${COLLEGE_DOMAIN}).`);
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const found = users.find((u) => u.email.toLowerCase() === trimmed && u.password === password);
    if (!found) {
      setError('Invalid college email ID or password.');
      return;
    }

    onLogin(found);
  };

  const quickFill = (role) => {
    const u = users.find((x) => x.role === role);
    if (!u) return;
    setEmail(u.email);
    setPassword(u.password);
    setSelectedType(role === 'student' ? 'student' : 'faculty');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 px-4 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
            <LogoIcon className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">SMS</h1>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mt-1">
              Schedule Management System
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs font-medium text-slate-500">
          Department of Computer Science &amp; Design (CSD) — Prototype
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Login</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                User Type
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {['student', 'faculty'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-bold border capitalize transition ${
                      selectedType === type
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                College Email ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={onForgot}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Trial Prototype Accounts (Click to Fill)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => quickFill('student')}
                className="text-left p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
              >
                <p className="text-xs font-bold text-blue-900">Student — Shivansh Gupta (CSD 1st Sem)</p>
                <p className="text-[11px] text-blue-700 font-mono">student@example.edu • Student@123</p>
              </button>
              <button
                type="button"
                onClick={() => quickFill('teacher')}
                className="text-left p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
              >
                <p className="text-xs font-bold text-indigo-900">Faculty — Arti Ahirwar (Micro Project Lab)</p>
                <p className="text-[11px] text-indigo-700 font-mono">teacher@example.edu • Teacher@123</p>
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin')}
                className="text-left p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
              >
                <p className="text-xs font-bold text-purple-900">HOD — Mahesh Parmar (Dept. of CSD)</p>
                <p className="text-[11px] text-purple-700 font-mono">hod@example.edu • HOD@123</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white max-w-md w-full p-7 rounded-2xl border border-slate-200 shadow-lg space-y-4">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
          <ArrowLeftIcon /> Back to Login
        </button>
        <h2 className="text-xl font-bold text-slate-900">Password Recovery</h2>
        <p className="text-sm text-slate-600">
          Enter your college email ID to check recovery options for your SMS prototype account.
        </p>
        {submitted ? (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900">
            Password reset functionality will be available in a future version. For prototype testing, use the trial credentials on the Login page.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">
              Request Reset
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function StudentDashboard({ user, schedule, requests, notifications, navigate }) {
  const today = getTodayName();
  const todayClasses = schedule
    .filter((s) => s.day === today)
    .sort((a, b) => a.startHour - b.startHour);
  const myRequests = requests.filter((r) => r.studentEmail === user.email);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {user.branch} • {user.semester}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            College Timings: 10:00 AM – 6:00 PM • Lunch Break: 1:00 PM – 2:00 PM
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/student/schedule')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
          >
            View Full Timetable
          </button>
          <button
            onClick={() => navigate('/student/requests/new')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200"
          >
            + Request Room / Lab
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">{today}&apos;s Classes</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{todayClasses.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">My Room Requests</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{myRequests.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Unread Alerts</p>
          <p className="text-3xl font-black text-amber-600 mt-1">
            {notifications.filter((n) => !n.read).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Schedule for {today}</h2>
          <button onClick={() => navigate('/student/schedule')} className="text-xs font-bold text-blue-600 hover:underline">
            Weekly View →
          </button>
        </div>
        {today === 'Saturday' && todayClasses.length === 0 ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            Saturday is a Holiday. No extra classes are scheduled today.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayClasses.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-blue-700">{formatRange(c.startHour, c.duration)}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {c.room}
                  </span>
                </div>
                <p className="font-bold text-slate-900 mt-1">
                  {c.subjectCode} — {c.subjectName}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">Faculty: {c.teacher}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentNewRequestPage({ user, rooms, schedule, onSubmit }) {
  const [room, setRoom] = useState(rooms[0]?.id || 'ROOM-004');
  const [day, setDay] = useState('Tuesday');
  const [startHour, setStartHour] = useState(15);
  const [duration, setDuration] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (startHour === 13 || (startHour === 12 && duration === 2)) {
      setError('1:00 PM – 2:00 PM is Lunch Break. Please choose another slot.');
      return;
    }
    if (startHour + duration > 18) {
      setError('Slot exceeds college closing time (6:00 PM).');
      return;
    }
    const clash = schedule.find(
      (s) => s.day === day && s.room === room && overlaps(s.startHour, s.duration, startHour, duration)
    );
    if (clash) {
      setError(`${room} is occupied on ${day} by ${clash.subjectName} (${formatRange(clash.startHour, clash.duration)}).`);
      return;
    }
    if (!purpose.trim()) {
      setError('Please describe the purpose (club activity, micro project, etc.).');
      return;
    }

    onSubmit({
      id: `req-${Date.now()}`,
      studentName: user.name,
      studentEmail: user.email,
      branch: `${user.department} — ${user.semester}`,
      room,
      day,
      startHour,
      duration,
      purpose: purpose.trim(),
      status: 'Pending',
      hodReason: '',
      createdAt: 'Just now',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-2xl">
      <h1 className="text-xl font-black text-slate-900">Request Classroom or Laboratory</h1>
      <p className="text-xs text-slate-500 mt-1">
        Requests are reviewed by HOD Mahesh Parmar (Department of CSD).
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Room / Lab</label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}{d === 'Saturday' ? ' (Holiday / Extra)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Start Time</label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {[10, 11, 12, 14, 15, 16, 17].map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              <option value={1}>1 Hour</option>
              <option value={2}>2 Hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Purpose</label>
          <textarea
            rows={3}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g., Micro Project lab demo preparation or CSD club workshop"
            className="w-full p-3 rounded-xl border border-slate-300 text-sm"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
        >
          Submit Request to HOD
        </button>
      </form>
    </div>
  );
}

function StudentMyRequestsPage({ requests, navigate }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-slate-900">My Classroom &amp; Lab Requests</h1>
        <button
          onClick={() => navigate('/student/requests/new')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          + New Request
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          No requests submitted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900">{r.room}</span>
                  <span className="text-xs text-slate-500 ml-2">
                    {r.day} • {formatRange(r.startHour, r.duration)}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    r.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.status === 'Declined'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-2">{r.purpose}</p>
              {r.status === 'Declined' && r.hodReason && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <strong>HOD Decline Reason:</strong> {r.hodReason}
                </div>
              )}
              {r.status === 'Approved' && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  Approved by HOD Mahesh Parmar (CSD).
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FacultyDashboard({ user, schedule, rooms, navigate }) {
  const myClasses = schedule.filter((s) => s.teacher === user.name);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Faculty Portal — Dept. of {user.department}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Welcome, {user.name}</h1>
          <p className="text-sm text-slate-600 mt-1">Assigned Subject: {user.subject}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/teacher/schedules/create')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            + Add / Extra Class
          </button>
          <button
            onClick={() => navigate('/teacher/schedules/manage')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
          >
            Reschedule / Swap Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Your Scheduled Labs</p>
          <p className="text-3xl font-black text-indigo-600 mt-1">{myClasses.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Total CSD Weekly Slots</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{schedule.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Available Rooms / Labs</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{rooms.length}</p>
        </div>
      </div>

      <TimetableView
        schedule={schedule}
        highlightTeacher={user.name}
        title="CSD 1st Sem Timetable (Your Labs Highlighted)"
      />
    </div>
  );
}

function FacultyCreateSchedulePage({ rooms, schedule, onAdd }) {
  const [subjectCode, setSubjectCode] = useState('29261109');
  const [day, setDay] = useState('Saturday');
  const [startHour, setStartHour] = useState(10);
  const [room, setRoom] = useState('LAB PL2');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const selectedSub = SUBJECT_MAP[subjectCode];

  const handleSubjectChange = (code) => {
    setSubjectCode(code);
    setRoom(SUBJECT_MAP[code].defaultRoom);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const dur = selectedSub.duration;

    if (startHour === 13 || (startHour === 12 && dur === 2)) {
      setError('Cannot schedule during 1:00 PM – 2:00 PM Lunch Break.');
      return;
    }
    if (startHour + dur > 18) {
      setError('Class extends beyond 6:00 PM.');
      return;
    }

    const roomClash = schedule.find(
      (s) => s.day === day && s.room === room && overlaps(s.startHour, s.duration, startHour, dur)
    );
    if (roomClash) {
      setError(`Room conflict: ${room} already has ${roomClash.subjectName} at this time.`);
      return;
    }

    const batchClash = schedule.find(
      (s) => s.day === day && overlaps(s.startHour, s.duration, startHour, dur)
    );
    if (batchClash) {
      setError(`Student timetable conflict: CSD 1st Sem already has ${batchClash.subjectName} at this time.`);
      return;
    }

    onAdd({
      id: `sch-${Date.now()}`,
      day,
      startHour,
      duration: dur,
      subjectCode: selectedSub.code,
      subjectName: selectedSub.name,
      teacher: selectedSub.teacher,
      room,
      type: selectedSub.type,
      isExtraClass: day === 'Saturday',
      rescheduled: false,
      note: note.trim(),
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-2xl">
      <h1 className="text-xl font-black text-slate-900">Create Schedule / Saturday Extra Class</h1>
      <p className="text-xs text-slate-500 mt-1">
        Duration and default classroom/lab are auto-filled per CSD subject rules. Classes on Saturday are tagged as Extra Classes.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Subject &amp; Faculty</label>
          <select
            value={subjectCode}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
          >
            {SUBJECTS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name} ({s.teacher}) [{s.duration}hr {s.type}]
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}{d === 'Saturday' ? ' (Extra Class)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Start Time</label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {[10, 11, 12, 14, 15, 16, 17].map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Room / Lab</label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Note for Students (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Bring micro project report & laptop"
            className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
          />
        </div>

        <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold">
          Save &amp; Notify Students
        </button>
      </form>
    </div>
  );
}

function FacultyManageSchedulePage({ schedule, rooms, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (editing.startHour === 13 || (editing.startHour === 12 && editing.duration === 2)) {
      setError('Cannot move class into Lunch Break (1:00 PM – 2:00 PM).');
      return;
    }
    if (editing.startHour + editing.duration > 18) {
      setError('Class cannot go past 6:00 PM.');
      return;
    }
    const clash = schedule.find(
      (s) =>
        s.id !== editing.id &&
        s.day === editing.day &&
        overlaps(s.startHour, s.duration, editing.startHour, editing.duration)
    );
    if (clash) {
      setError(`Slot overlaps with ${clash.subjectName} (${formatRange(clash.startHour, clash.duration)}).`);
      return;
    }

    onUpdate({
      ...editing,
      isExtraClass: editing.day === 'Saturday',
      rescheduled: true,
    });
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-slate-900">Reschedule Classes &amp; Swap Rooms</h1>

      {editing && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold text-blue-950">
            Editing: {editing.subjectCode} — {editing.subjectName} ({editing.duration} hr)
          </h2>
          {error && <p className="text-xs font-bold text-red-700 bg-red-50 p-2.5 rounded-lg">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={editing.day}
              onChange={(e) => setEditing({ ...editing, day: e.target.value })}
              className="p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={editing.startHour}
              onChange={(e) => setEditing({ ...editing, startHour: Number(e.target.value) })}
              className="p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {[10, 11, 12, 14, 15, 16, 17].map((h) => (
                <option key={h} value={h}>{formatHour(h)}</option>
              ))}
            </select>
            <select
              value={editing.room}
              onChange={(e) => setEditing({ ...editing, room: e.target.value })}
              className="p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={editing.note || ''}
            onChange={(e) => setEditing({ ...editing, note: e.target.value })}
            placeholder="Reason for preponing / postponing / room change"
            className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
              Confirm &amp; Notify Students
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {schedule.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-blue-700">
                  {item.day} • {formatRange(item.startHour, item.duration)}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">{item.room}</span>
              </div>
              <p className="font-bold text-slate-900 mt-1">
                {item.subjectCode} — {item.subjectName}
              </p>
              <p className="text-xs text-slate-600">{item.teacher}</p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setError('');
                  setEditing({ ...item });
                }}
                className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold"
              >
                Reschedule / Swap
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomAvailabilityPage({ rooms, schedule }) {
  const [day, setDay] = useState('Wednesday');
  const [hour, setHour] = useState(14);

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Room &amp; Lab Availability</h1>
          <p className="text-xs text-slate-500">Check live classroom and laboratory status across CSD slots.</p>
        </div>
        <div className="flex gap-2">
          <select value={day} onChange={(e) => setDay(e.target.value)} className="p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white">
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={hour} onChange={(e) => setHour(Number(e.target.value))} className="p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white">
            {HOURS.filter((h) => h !== 13).map((h) => (
              <option key={h} value={h}>{formatRange(h, 1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r) => {
          const occupied = schedule.find(
            (s) => s.day === day && s.room === r.id && overlaps(s.startHour, s.duration, hour, 1)
          );
          return (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">{r.name}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    occupied ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {occupied ? 'Occupied' : 'Available'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {r.type} • Capacity: {r.capacity} • {r.block}
              </p>
              {occupied && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-bold text-slate-800">{occupied.subjectName}</p>
                  <p className="text-slate-600">{occupied.teacher}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HodDashboard({ user, schedule, requests, rooms, users, navigate }) {
  const pending = requests.filter((r) => r.status === 'Pending');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            HOD Administrative Portal — Dept. of {user.department}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Welcome, {user.name}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Review classroom/lab requests and oversee the CSD 1st Semester timetable.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/admin/requests')} className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
            Review Requests ({pending.length})
          </button>
          <button onClick={() => navigate('/admin/schedules')} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
            Master Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Pending Requests</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{pending.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Active Classes</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{schedule.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Rooms &amp; Labs</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{rooms.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Portal Accounts</p>
          <p className="text-3xl font-black text-purple-600 mt-1">{users.length}</p>
        </div>
      </div>

      <TimetableView schedule={schedule} title="Department Master Overview — CSD 1st Semester" />
    </div>
  );
}

function HodRequestsPage({ requests, onDecision }) {
  const [reasons, setReasons] = useState({});
  const [errorId, setErrorId] = useState(null);

  const handleDecline = (id) => {
    const reason = (reasons[id] || '').trim();
    if (!reason) {
      setErrorId(id);
      return;
    }
    setErrorId(null);
    onDecision(id, 'Declined', reason);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-slate-900">Classroom &amp; Lab Request Approvals</h1>
      {requests.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          No requests found.
        </div>
      ) : (
        requests.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900">
                  {r.studentName} <span className="text-xs font-normal text-slate-500">({r.branch})</span>
                </p>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  {r.room} • {r.day} • {formatRange(r.startHour, r.duration)}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  r.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : r.status === 'Declined'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {r.status}
              </span>
            </div>

            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{r.purpose}</p>

            {r.status === 'Pending' ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={reasons[r.id] || ''}
                  onChange={(e) => setReasons({ ...reasons, [r.id]: e.target.value })}
                  placeholder="Enter reason (mandatory if declining)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
                {errorId === r.id && (
                  <p className="text-xs font-bold text-red-600">Please enter a reason before declining this request.</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => onDecision(r.id, 'Approved', '')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleDecline(r.id)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                  >
                    Decline with Reason
                  </button>
                </div>
              </div>
            ) : (
              r.hodReason && (
                <p className="text-xs text-red-700">
                  <strong>Decline Reason:</strong> {r.hodReason}
                </p>
              )
            )}
          </div>
        ))
      )}
    </div>
  );
}

function HodMasterSchedulePage({ schedule, rooms, onReset }) {
  const [roomFilter, setRoomFilter] = useState('ALL');
  const filtered = roomFilter === 'ALL' ? schedule : schedule.filter((s) => s.room === roomFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-slate-900">Master Department Schedule (CSD)</h1>
        <div className="flex items-center gap-2">
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="ALL">All Rooms &amp; Labs</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button onClick={onReset} className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800">
            Reset Default Data
          </button>
        </div>
      </div>

      <TimetableView schedule={filtered} title={`CSD Master Timetable (${roomFilter})`} />
    </div>
  );
}

function HodManagePage({ rooms, users, onAddRoom, onDeleteRoom, onReset }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Classroom');
  const [capacity, setCapacity] = useState(60);

  const handleAdd = (e) => {
    e.preventDefault();
    const id = name.trim().toUpperCase();
    if (!id) return;
    onAddRoom({ id, name: id, type, capacity: Number(capacity), block: 'CSD Block' });
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-slate-900">Rooms, Labs &amp; Users Management</h1>
        <button onClick={onReset} className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold">
          Reset Demo Prototype
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-900">Allocated Rooms &amp; Labs</h2>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., LAB PL3"
              className="flex-1 min-w-[120px] p-2 rounded-xl border border-slate-300 text-xs"
            />
            <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 rounded-xl border border-slate-300 text-xs bg-white">
              <option>Classroom</option>
              <option>Computer Lab</option>
              <option>Seminar Hall</option>
            </select>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-20 p-2 rounded-xl border border-slate-300 text-xs"
            />
            <button type="submit" className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
              Add
            </button>
          </form>

          <div className="space-y-2">
            {rooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{r.name}</span>
                  <span className="text-slate-500 ml-2">{r.type} • Cap {r.capacity}</span>
                </div>
                <button onClick={() => onDeleteRoom(r.id)} className="text-red-600 font-bold hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <h2 className="font-bold text-slate-900">Active Prototype Accounts</h2>
          {users.map((u) => (
            <div key={u.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">{u.name}</p>
                <p className="text-slate-500">{u.email}</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold uppercase text-[10px]">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsPage({ notifications, onMarkAllRead }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">Notifications Inbox</h1>
        <button onClick={onMarkAllRead} className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold">
          Mark All Read
        </button>
      </div>
      <div className="space-y-2.5">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border ${
              n.read ? 'bg-white border-slate-200' : 'bg-blue-50/70 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-sm text-slate-900">{n.title}</p>
              <span className="text-[11px] text-slate-500">{n.time}</span>
            </div>
            <p className="text-xs text-slate-700 mt-1">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ user, onReset }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-600">{user.email}</p>
          <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 uppercase">Role: {user.role}</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">Department: {user.department}</span>
            {user.semester && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">{user.semester}</span>
            )}
            {user.subject && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800">{user.subject}</span>
            )}
          </div>
        </div>
        <button onClick={onReset} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 self-start">
          Reset Prototype Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">CSD 1st Semester — Subjects &amp; Faculty Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                <th className="p-3 font-bold">Code</th>
                <th className="p-3 font-bold">Subject</th>
                <th className="p-3 font-bold">Faculty</th>
                <th className="p-3 font-bold">Duration</th>
                <th className="p-3 font-bold">Allocated Room</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map((s) => (
                <tr key={s.code} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-800">{s.code}</td>
                  <td className="p-3 font-semibold text-slate-900">{s.name}</td>
                  <td className="p-3 text-slate-700">{s.teacher}</td>
                  <td className="p-3 text-slate-600">{s.duration} hr ({s.type})</td>
                  <td className="p-3 font-bold text-blue-700">{s.defaultRoom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ErrorPage({ code, title, navigate, role }) {
  return (
    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center max-w-md mx-auto mt-10">
      <p className="text-4xl font-black text-blue-600">{code}</p>
      <h1 className="text-lg font-bold text-slate-900 mt-2">{title}</h1>
      <p className="text-xs text-slate-500 mt-1">
        You do not have permission to view this page or the route does not exist.
      </p>
      <button
        onClick={() => navigate(roleHome(role))}
        className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
