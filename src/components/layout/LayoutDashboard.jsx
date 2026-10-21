import { NavLink, Outlet } from "react-router-dom";

export default function LayoutDashboard({ judul, menu }) {
  return (
    <div className="dash container">
      <aside className="dash-side">
        <p className="dash-judul">{judul}</p>
        {menu.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive ? "on" : "")}>
            {m.label}
          </NavLink>
        ))}
      </aside>
      <section className="dash-main">
        <Outlet />
      </section>
    </div>
  );
}
