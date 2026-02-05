// const Maintenance = () => {
//   return (
//     <div style={{
//       height: "100vh",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       background: "#f4f6f8"
//     }}>
//       <div style={{
//         width: 520,
//         background: "#fff",
//         padding: 30,
//         borderRadius: 10,
//         boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
//         textAlign: "center"
//       }}>
//         <h2>🔒 Account Temporarily Restricted</h2>

//         <p style={{ marginTop: 20 }}>
//           Access to <b>SmartFlow360 ERP</b> has been temporarily suspended
//           due to pending payment.
//         </p>

//         <div style={{
//           marginTop: 20,
//           padding: 15,
//           background: "#fff3cd",
//           borderRadius: 6
//         }}>
//           <b>Status:</b> Payment Pending <br />
//           <b>Action Required:</b> Clear outstanding amount
//         </div>

//         <p style={{ marginTop: 20 }}>
//           System access will be restored after payment confirmation.
//         </p>

//         <hr />

//         <p style={{ fontSize: 13, color: "#666" }}>
//           This action is applied as per agreed project terms.
//           Your data remains safe and unchanged.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Maintenance;
import { motion } from "framer-motion";

const Maintenance = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-white to-[#d8b76a]">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl px-10 py-12 text-center max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <img
          src="/images/logo.png"
          alt="SmartFlow360 Logo"
          className="w-48 mx-auto mb-6"
        />

{/* Maintenance Animation */}
<motion.div
  className="mb-6 text-center"
  animate={{ opacity: [0.4, 1, 0.4] }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  <p className="text-sm font-semibold text-[#d8b76a] tracking-widest">
    UPGRADING SYSTEM
  </p>
</motion.div>
<motion.div
  className="mb-6 text-[#d8b76a] text-5xl"
  animate={{ rotate: [0, 12, -12, 0] }}
  transition={{ repeat: Infinity, duration: 2.5 }}
>
  🛠️
</motion.div>

<motion.p
  className="text-xs tracking-widest text-gray-500"
  animate={{ opacity: [0.4, 1, 0.4] }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  SYSTEM MAINTENANCE
</motion.p>



        <h2 className="text-2xl font-bold text-gray-800">
          We're Back Soon! 🚧
        </h2>

        <p className="mt-4 text-gray-600 text-sm leading-relaxed">
          SmartFlow360 is currently undergoing scheduled maintenance.
          <br />
          We’re making improvements to serve you better.
        </p>

        <p className="mt-3 text-xs text-gray-500">
          Please check back shortly.
        </p>

        {/* Optional Powered By */}
        <div className="flex justify-center items-center gap-2 mt-6 opacity-80">
          <span className="text-xs">Powered By</span>
          <img
            src="/images/logo2.png"
            alt="Powered By"
            className="w-48"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;
