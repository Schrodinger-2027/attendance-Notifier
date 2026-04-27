/**
 * Service: Email Templates
 * Generates HTML/text payloads for attendance notifications.
 */

function buildEmailPayload({ student, status, prev, schoolName, className }) {
  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (status === "absent") {
    return {
      subject: `⚠️ Attendance Alert — ${student.name} is Absent`,
      text: `Dear ${student.parent},\n\nYour child ${student.name} has been marked ABSENT in ${className} on ${date}.\n\nIf unexpected, please contact the school.\n\n— ${schoolName}`,
      html: template({ title: "Absence Alert", color: "#ff5f7e", icon: "⚠️", studentName: student.name, parentName: student.parent, status: "ABSENT", statusColor: "#ff5f7e", message: `Your child was marked <strong>Absent</strong> today in ${className}.`, note: "If this is unexpected, please contact the school or call the class teacher.", date, schoolName }),
    };
  }

  if (status === "late") {
    return {
      subject: `🕐 Late Arrival — ${student.name}`,
      text: `Dear ${student.parent},\n\nYour child ${student.name} arrived LATE to ${className} on ${date}.\n\n— ${schoolName}`,
      html: template({ title: "Late Arrival", color: "#f9a825", icon: "🕐", studentName: student.name, parentName: student.parent, status: "LATE", statusColor: "#f9a825", message: `Your child arrived <strong>late</strong> to ${className} today.`, note: "Consistent late arrivals can affect academic performance.", date, schoolName }),
    };
  }

  if (status === "present" && (prev === "absent" || prev === "late")) {
    return {
      subject: `✅ Update — ${student.name} is now Present`,
      text: `Dear ${student.parent},\n\nAn earlier alert for ${student.name} has been resolved. They are now marked PRESENT on ${date}.\n\n— ${schoolName}`,
      html: template({ title: "Alert Resolved", color: "#3ecf8e", icon: "✅", studentName: student.name, parentName: student.parent, status: "NOW PRESENT", statusColor: "#3ecf8e", message: `An earlier alert has been resolved. ${student.name} is now marked <strong>Present</strong>.`, note: "No further action is needed.", date, schoolName }),
    };
  }

  return null; // no email needed
}

function template({ title, color, icon, studentName, parentName, status, statusColor, message, note, date, schoolName }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:${color};padding:28px 32px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">${icon}</div>
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">${title}</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">${schoolName}</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;color:#374151;font-size:15px;">Dear <strong>${parentName}</strong>,</p>
          <div style="text-align:center;margin:20px 0;">
            <div style="display:inline-block;background:${statusColor}18;border:1.5px solid ${statusColor}40;border-radius:8px;padding:16px 32px;">
              <div style="font-size:13px;color:#6b7280;margin-bottom:4px;">Student</div>
              <div style="font-size:20px;font-weight:600;color:#111827;">${studentName}</div>
              <div style="margin-top:8px;background:${statusColor};color:#fff;border-radius:99px;font-size:12px;font-weight:700;padding:4px 16px;display:inline-block;">${status}</div>
            </div>
          </div>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0;">${message}</p>
          <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px;">${note}</p>
          <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;font-size:12px;color:#9ca3af;">📅 ${date}</div>
        </td></tr>
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Automated alert from <strong>${schoolName}</strong>. Do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { buildEmailPayload };
