import Link from "next/link";

const links = [
  ["Dashboard", "/dashboard"],
  ["Ouestions", "/ouestions"],
  ["Example", "/example"],
  ["Answers", "/answers"],
  ["Grade", "/grade"],
  ["GradeList", "/grade-list"],
  ["Rated", "/rated"],
  ["RatedList", "/rated-list"],
  ["Average", "/average"],
  ["Print", "/print"],
  ["Delete", "/delete"],
  ["ChangePassword", "/change-password"],
  ["Admin", "/admin"]
];

export default function List() {
  return (
    <div className="info-card mb-4">
      <h3>Client + Admin Pages</h3>
      <div className="d-flex gap-2 flex-wrap">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="btn btn-outline-primary btn-sm">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
