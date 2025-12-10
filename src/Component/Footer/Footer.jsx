export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} MySite. All rights reserved.</p>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: "40px",
    padding: "20px",
    textAlign: "center",
    background: "#0f172a",
    color: "white",
  },
};
