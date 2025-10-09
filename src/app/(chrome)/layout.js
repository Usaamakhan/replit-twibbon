import ConditionalLayout from "../../components/ConditionalLayout";
import NotificationProvider from "../../components/notifications/NotificationProvider";

export default function ChromeLayout({ children }) {
  return (
    <ConditionalLayout>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ConditionalLayout>
  );
}