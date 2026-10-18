import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }){
    return(
        <div className="layout">
            <Header />
            <div className="layout-body">
                <Sidebar />
                <main className="content">{children}</main>
            </div>
        </div>        
    );
}