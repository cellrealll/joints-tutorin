import angelaPhoto from '../../../images/profiles/360_F_321677228_PybtVjGqx90y34jQzbyeALHhOncLC8DR.jpg';
import './TutorPortrait.css';

export default function TutorPortrait({ name }) {
  if (name === 'Angela Wilkins') return <img className="tutor-portrait-image" src={angelaPhoto} alt="Angela Wilkins" />;
  return <svg className="tutor-portrait-placeholder" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="40" fill="#DDDCE5" /><circle cx="40" cy="29" r="12" fill="white" /><path d="M19 66v-6a21 21 0 0 1 42 0v6Z" fill="white" /></svg>;
}
