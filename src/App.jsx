
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import LandingPage from "./pages/landing/LandingPage";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import SearchBar from "./components/common/SearchBar";
import AppIcon from "./components/common/AppIcon";
import TitoGuide from "./components/onboarding/TitoGuide";

import Dashboard from "./pages/mentee/dashboard/Dashboard";
import CareerRoadmap from "./pages/mentee/career/CareerRoadmap";
import SkillAnalysis from "./pages/mentee/career/SkillAnalysis";
import CareerPortfolio from "./pages/mentee/career/CareerPortfolio";
import IndustryMentorship from "./pages/mentee/career/IndustryMentorship";
import CareerOpportunities from "./pages/mentee/career/CareerOpportunities";
import CariTutor from "./pages/mentee/cari tutor/CariTutor";
import Profil from "./pages/mentee/profil mentee/Profil";
import ProfilMentor from "./pages/mentee/profil mentor/ProfilMentor";
import RiwayatKredit from "./pages/mentee/riwayat kredit/RiwayatKredit";
import Sesi from "./pages/mentee/sesi/Sesi";
import Shop from "./pages/mentee/shop/Shop";
import BookingSesi from "./pages/mentee/booking sesi/BookingSesi";
import DetailSesi from "./pages/mentee/detail sesi/DetailSesi";
import PreTest from "./pages/mentee/test/PreTest";
import PostTest from "./pages/mentee/test/PostTest";
import { courseFor } from "./pages/mentee/test/testData";
import { booking, tutor as bookingMentor } from "./pages/mentee/sessionData";
import DashboardMentor from "./pages/mentor/dashboard/DashboardMentor";
import MentorCertificates from "./pages/mentor/certificates/MentorCertificates";
import { updateProfile, useProfile } from "./state/profile";

import "./pages/mentee/dashboard/Dashboard.css";
import "./pages/mentee/cari tutor/CariTutor.css";
import "./pages/mentee/booking sesi/BookingSesi.css";
import "./pages/mentee/detail sesi/DetailSesi.css";
import "./styles/MenteeTheme.css";

function AlternatePage({ active, setActive, onActivateMentor }) {
  const [error, setError] = useState("");
  const pages = {
    "Cari course": {
      icon: "fa7-solid:search",
      title: "Cari course",
      description:
        "Temukan course yang sesuai dengan skill gap dan target belajarmu.",
    },
    "Jadi mentor": {
      icon: "fluent:hat-graduation-12-regular",
      title: "Mulai mengajar",
      description:
        "Bagikan keahlianmu, bantu pelajar lain, dan dapatkan kredit.",
    },
  };

  const page = pages[active];

  if (!page) return null;

  return (
    <div className="alternate-page">
      <div className="alternate-icon">
        <AppIcon name={page.icon} size={42} />
      </div>
      <h1>{page.title}</h1>
      <p>{page.description}</p>
      {active === "Jadi mentor" && <>
        <button className="primary-button" onClick={() => {
          try { onActivateMentor(); } catch { setError("Peran mentor belum tersimpan. Periksa izin penyimpanan browser."); }
        }}><AppIcon name="fluent:hat-graduation-12-regular" size={20} />Aktifkan peran mentor</button>
        <p role="status">{error}</p>
      </>}
      <button
        className="primary-button"
        onClick={() => setActive("Beranda")}
      >
        <AppIcon name="solar:alt-arrow-left-linear" size={18} />
        Kembali ke Beranda
      </button>
    </div>
  );
}

export default function App() {
  const [entered, setEntered] = useState(() => window.location.hash === "#dashboard");
  useEffect(() => {
    const onHashChange = () => setEntered(window.location.hash === "#dashboard");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const profile = useProfile();
  const [preferredMode, setPreferredMode] = useState(() => {
    try { return localStorage.getItem("tutorin-dashboard-mode") === "mentor" ? "mentor" : "mentee"; }
    catch { return "mentee"; }
  });
  const dashboardMode = profile.mentorActive ? preferredMode : "mentee";
  const [active, updateActive] = useState("Beranda");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [profileOrigin, setProfileOrigin] = useState("Beranda");
  const [detailSession, setDetailSession] = useState(null);
  const [detailOrigin, setDetailOrigin] = useState("Courses");
  const [bookingNote, setBookingNote] = useState("");
  const [assessmentSession, setAssessmentSession] = useState(null);
  const [assessmentOrigin, setAssessmentOrigin] = useState("Sesi");
  const [courseDetailId, setCourseDetailId] = useState("");
  const [mentorshipCategory, setMentorshipCategory] = useState("Career Consultation");
  const switchingRole = useRef(false);

  function setActive(page) {
    if (dashboardMode === "mentor" && ["Shop"].includes(page)) return;
    if (page === "Jadi mentor" && profile.mentorActive) { switchDashboard("mentor"); return; }
    if (page === "Cari course") setCourseDetailId("");
    updateActive(page);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function switchDashboard(mode) {
    if (mode === "mentor" && !profile.mentorActive) { updateActive("Jadi mentor"); return; }
    if (switchingRole.current) return;
    const change = () => {
      setPreferredMode(mode);
      updateActive("Beranda");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    try { localStorage.setItem("tutorin-dashboard-mode", mode); } catch { /* Mode switching still works without saved preferences. */ }
    if (mode === dashboardMode || !entered || !document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      change();
      return;
    }
    switchingRole.current = true;
    const transition = document.startViewTransition(() => flushSync(change));
    transition.finished.then(
      () => { switchingRole.current = false; },
      () => { switchingRole.current = false; },
    );
  }

  function activateMentor() {
    updateProfile({ ...profile, mentorActive: true });
    setPreferredMode("mentor");
    try { localStorage.setItem("tutorin-dashboard-mode", "mentor"); } catch { /* The role itself was already saved. */ }
    updateActive("Beranda");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openTutor(tutor) {
    setProfileOrigin(active);
    setSelectedTutor(tutor);
    setActive("Profil mentor");
  }

  function openSessionDetail(session) {
    setDetailSession(session);
    setDetailOrigin(active);
    setActive("Detail Sesi");
  }

  function openTest(mode, session) {
    setAssessmentSession(session);
    setAssessmentOrigin(active);
    setActive(mode === "pre" ? "Pre-test" : "Post-test");
  }

  function openCoursePreTest(course) {
    setCourseDetailId(course.id);
    openTest("pre", {
      id: course.id,
      subject: course.title,
      courseId: course.courseId,
      tutor: "Course placement",
    });
  }

  function openCourseDetail(courseId) {
    setCourseDetailId(courseId);
    updateActive("Cari course");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function backFromAssessment() {
    if (assessmentSession?.id && assessmentSession.id === courseDetailId) {
      updateActive("Cari course");
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    setActive(assessmentOrigin);
  }

  const sessionPages = ["Booking Sesi", "Detail Sesi", "Pre-test", "Post-test"];

  if (!entered) return <LandingPage onChooseRole={(mode) => {
    switchDashboard(mode);
    window.location.hash = "dashboard";
    setEntered(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }} />;

  return (
    <div className={`app-shell mode-${dashboardMode}`}>
      <Sidebar
        active={
          sessionPages.includes(active)
            ? dashboardMode === "mentor" ? "Sesi" : "Courses"
            : active === "Profil mentor"
              ? profileOrigin
              : active
        }
        setActive={setActive}
        isMentor={profile.mentorActive}
        dashboardMode={dashboardMode}
        onSwitchMode={switchDashboard}
      />

      <main className="main-area">
        <div className="topbar-row">
          <SearchBar />
          <Header
            onProfileClick={() => setActive("Akun")}
            onShopClick={dashboardMode === "mentee" ? () => setActive("Shop") : undefined}
          />
        </div>

        <div className="page-view" key={`${active}-${dashboardMode}`}>
          {active === "Beranda" && dashboardMode === "mentor" ? (
            <DashboardMentor onSessions={() => setActive("Sesi")} onHistory={() => setActive("Riwayat Kredit")} onSwitchMode={switchDashboard} />
          ) : active === "Sertifikat Tutor" && dashboardMode === "mentor" ? (
            <MentorCertificates onSessions={() => setActive("Sesi")} />
          ) : active === "Beranda" ? (
            <Dashboard
              setActive={setActive}
              onTutorProfile={openTutor}
              onDetailSession={openSessionDetail}
              onProfile={() => setActive("Profil mentor")}
              onCourseDetail={openCourseDetail}
            />
          ) : active === "Career Roadmap" ? (
            <CareerRoadmap onCourseDetail={openCourseDetail} setActive={setActive} />
          ) : active === "Skill Analysis" ? (
            <SkillAnalysis setActive={setActive} onCourseDetail={openCourseDetail} onTutorProfile={openTutor} />
          ) : active === "Career Portfolio" ? (
            <CareerPortfolio setActive={setActive} onPortfolioReview={() => { setMentorshipCategory("Portfolio Review"); setActive("Industry Mentorship"); }} />
          ) : active === "Industry Mentorship" ? (
            <IndustryMentorship setActive={setActive} onOpenSession={openSessionDetail} initialCategory={mentorshipCategory} />
          ) : active === "Career Opportunities" ? (
            <CareerOpportunities setActive={setActive} onCourseDetail={openCourseDetail} />
          ) : active === "Cari tutor" || active === "Cari mentor" || active === "Cari course" ? (
            <CariTutor
              key={courseDetailId || "catalog"}
              onProfile={openTutor}
              onStartPreTest={openCoursePreTest}
              initialCourseId={courseDetailId}
              onRoadmap={() => setActive("Career Roadmap")}
            />
          ) : active === "Profil mentor" ? (
            <ProfilMentor
              tutor={selectedTutor}
              setActive={setActive}
              backPage={profileOrigin}
              onBack={() => setActive(profileOrigin)}
            />
          ) : active === "Akun" ? (
            <Profil setActive={setActive} />
          ) : active === "Sesi" ? (
            <Sesi setActive={setActive} onDetailSession={openSessionDetail} dashboardMode={dashboardMode} initialRoleFilter={dashboardMode === "mentor" ? "Mengajar" : "Semua"} />
          ) : active === "Courses" ? (
            <Sesi setActive={setActive} onDetailSession={openSessionDetail} dashboardMode={dashboardMode} initialRoleFilter={dashboardMode === "mentor" ? "Mengajar" : "Semua"} />
          ) : active === "Pre-test" && assessmentSession ? (
            <PreTest key={`${assessmentSession.id}-pre`} session={assessmentSession} courseId={assessmentSession.courseId || courseFor(assessmentSession.subject)}
              onBack={backFromAssessment} />
          ) : active === "Post-test" && assessmentSession ? (
            <PostTest key={`${assessmentSession.id}-post`} session={assessmentSession} courseId={assessmentSession.courseId || courseFor(assessmentSession.subject)}
              onBack={backFromAssessment} />
          ) : active === "Riwayat Kredit" ? (
            <RiwayatKredit setActive={setActive} dashboardMode={dashboardMode} />
          ) : active === "Shop" ? (
            <Shop setActive={setActive} />
          ) : active === "Booking Sesi" ? (
            <BookingSesi
              bookingNote={bookingNote}
              onBack={() => setActive("Cari course")}
              onBookingNoteChange={setBookingNote}
              onSessionDetail={() => openSessionDetail(null)}
              onHome={() => setActive("Beranda")}
              onTeach={() => setActive("Jadi mentor")}
            />
          ) : active === "Detail Sesi" ? (
            <DetailSesi
              session={detailSession}
              bookingNote={bookingNote}
              onOpenTest={(mode) => openTest(mode, detailSession || { id: booking.code, subject: booking.topic, tutor: bookingMentor.name })}
              onBack={() => setActive(detailOrigin === "Booking Sesi" ? "Courses" : detailOrigin)}
              onTeach={() => setActive("Jadi mentor")}
            />
          ) : (
            <AlternatePage active={active} setActive={setActive} onActivateMentor={activateMentor} />
          )}
        </div>
      </main>
      <TitoGuide key={`${profile.email || profile.username}-${dashboardMode}`} profile={profile} role={dashboardMode} onNavigate={setActive} />
    </div>
  );
}
