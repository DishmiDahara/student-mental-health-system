import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_diagram():
    # Setup high-quality academic figure
    fig, ax = plt.subplots(figsize=(22, 13), dpi=300)
    ax.set_xlim(0, 22)
    ax.set_ylim(0, 13)
    ax.axis('off')
    
    # Clean white background
    fig.patch.set_facecolor('#FFFFFF')
    
    # Title at the top (Academic Style)
    ax.text(11.0, 12.6, "Figure 4.1: System Architecture Diagram", ha='center', va='center', 
            fontsize=18, fontweight='bold', color='#1A202C', fontname='DejaVu Sans')
    
    # Subtitle for project context
    ax.text(11.0, 12.2, "MindSpace - Student Mental Health Support System Three-Tier Architecture", ha='center', va='center', 
            fontsize=12.5, style='italic', color='#4A5568', fontname='DejaVu Sans')

    # Helper to draw boundary boxes for layers
    def draw_layer_boundary(x, y, w, h, title, title_color):
        boundary = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.1",
            ec="#94A3B8", fc="#F8FAFC", ls="--", lw=1.2
        )
        ax.add_patch(boundary)
        # Layer Header Text
        ax.text(x + 0.2, y + h - 0.25, title, ha='left', va='center', 
                fontsize=11.5, fontweight='bold', color=title_color, fontname='DejaVu Sans')

    # Helper to draw UML-style component boxes (increased height and refined text layout)
    def draw_uml_box(x, y, w, h, title, subtitle, bg_color, border_color):
        box = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.08",
            ec=border_color, fc=bg_color, lw=1.8
        )
        ax.add_patch(box)
        
        # Draw title text (adjusted vertical position to avoid overlap)
        ax.text(x + w/2, y + h - 0.25, title, ha='center', va='top', 
                fontsize=9.5, fontweight='bold', color='#1A202C', fontname='DejaVu Sans')
        # Draw description text (adjusted vertical position to avoid overlap)
        if subtitle:
            ax.text(x + w/2, y + 0.18, subtitle, ha='center', va='bottom', 
                    fontsize=8.2, color='#4A5568', fontname='DejaVu Sans')

    # Helper to draw database cylinder (MongoDB)
    def draw_cylinder(x, y, w, h, bg_color="#E6FFFA", border_color="#319795"):
        # Bottom ellipse
        bottom_ellipse = patches.Ellipse((x + w/2, y), w, h * 0.25, ec=border_color, fc=bg_color, lw=1.8)
        ax.add_patch(bottom_ellipse)
        
        # Body rectangle
        body = patches.Rectangle((x, y), w, h * 0.75, ec="none", fc=bg_color)
        ax.add_patch(body)
        
        # Left and Right vertical borders
        ax.plot([x, x], [y, y + h * 0.75], color=border_color, lw=1.8)
        ax.plot([x + w, x + w], [y, y + h * 0.75], color=border_color, lw=1.8)
        
        # Top ellipse (fully visible)
        top_ellipse = patches.Ellipse((x + w/2, y + h * 0.75), w, h * 0.25, ec=border_color, fc=bg_color, lw=1.8)
        ax.add_patch(top_ellipse)
        
        # Label in the cylinder center
        ax.text(x + w/2, y + h * 0.45, "MongoDB\nDatabase", ha='center', va='center', 
                fontsize=10, fontweight='bold', color='#1A202C', fontname='DejaVu Sans')

    # 1. Draw Layer Boundaries
    # Layer 1: Client Layer (Frontend)
    draw_layer_boundary(0.5, 8.4, 15.5, 3.4, "Client Layer (Frontend) - React 19 Single Page Application", "#2B6CB0")
    
    # Layer 2: Application Layer (Backend)
    draw_layer_boundary(0.5, 4.3, 15.5, 3.7, "Application Layer (Backend) - Node.js + Express.js Server", "#B7791F")
    
    # Layer 3: Data Layer
    draw_layer_boundary(0.5, 0.4, 15.5, 3.5, "Data Layer (Database)", "#319795")
    
    # External Services Boundary (Right Side)
    draw_layer_boundary(16.5, 4.3, 5.0, 7.5, "External Integration", "#4A5568")

    # 2. Draw Components inside Client Layer (Frontend)
    box_w = 2.8
    box_h = 1.3  # Increased height to provide clean margins

    # Row 1 of Client Layer (Dashboards & Peer Chat)
    draw_uml_box(1.0, 10.1, box_w, box_h, "Student Dashboard", "Student profile, mood history\n& session status view", "#EBF8FF", "#2B6CB0")
    draw_uml_box(4.5, 10.1, box_w, box_h, "Counsellor Dashboard", "Manage requests, bookings\n& view student history", "#EBF8FF", "#2B6CB0")
    draw_uml_box(8.0, 10.1, box_w, box_h, "Admin Dashboard", "User authorization,\napplications & audit logs", "#EBF8FF", "#2B6CB0")
    draw_uml_box(12.5, 10.1, box_w, box_h, "Anonymous Peer Chat\nInterface", "Student peer-to-peer\nreal-time support UI", "#E6FFFA", "#319795")

    # Row 2 of Client Layer (Specific Features)
    draw_uml_box(1.5, 8.6, box_w, box_h, "Aura AI Chatbot UI", "Interactive dialog interface\nfor emotional support", "#EBF8FF", "#2B6CB0")
    draw_uml_box(5.0, 8.6, box_w, box_h, "Mood Tracking UI", "Mood registration, charts\n& emotion indicators", "#EBF8FF", "#2B6CB0")
    draw_uml_box(8.5, 8.6, box_w, box_h, "Counsellor Booking UI", "Therapist schedules,\nslot selection & booking", "#EBF8FF", "#2B6CB0")

    # 3. Draw Components inside Application Layer (Backend)
    backend_box_w = 3.6
    backend_box_h = 1.3  # Increased height to provide clean margins

    # Row 1 of Backend (Gateways and Real-time Core)
    draw_uml_box(1.0, 6.3, backend_box_w, backend_box_h, "REST API Gateway", "Routing, Express controllers\n& request endpoints", "#FEFCBF", "#B7791F")
    draw_uml_box(6.0, 6.3, backend_box_w, backend_box_h, "Security & Auth Module", "JWT Authentication,\nRole-Based Access Control", "#FEFCBF", "#B7791F")
    draw_uml_box(11.0, 6.3, backend_box_w, backend_box_h, "Socket.IO Server", "Manages active WebSockets;\nanonymous peer connection", "#EBF8FF", "#2B6CB0")

    # Row 2 of Backend (Core Business Logic)
    draw_uml_box(1.0, 4.5, backend_box_w, backend_box_h, "Sentiment Analysis Engine", "Process chats, check severity\n& record mood metrics", "#FEFCBF", "#B7791F")
    draw_uml_box(6.0, 4.5, backend_box_w, backend_box_h, "Appointment Scheduling", "Schedule coordination,\ncalendar logs & notifications", "#FEFCBF", "#B7791F")
    draw_uml_box(11.0, 4.5, backend_box_w, backend_box_h, "Core Business Logic", "Processes registrations,\napplications & upload routing", "#FEFCBF", "#B7791F")

    # 4. Draw Components inside Data Layer
    draw_cylinder(1.5, 0.9, 3.2, 2.0)
    
    # Collections Box
    collections_box = patches.FancyBboxPatch(
        (5.5, 0.7), 9.5, 2.2,
        boxstyle="round,pad=0.08",
        ec="#319795", fc="#E6FFFA", lw=1.8
    )
    ax.add_patch(collections_box)
    ax.text(5.8, 2.5, "MongoDB Database Collections", ha='left', va='center', 
            fontsize=10.5, fontweight='bold', color='#234E52', fontname='DejaVu Sans')
    
    # Sub-boxes for each collection
    def draw_collection_tag(x, y, name):
        tag = patches.FancyBboxPatch(
            (x, y), 2.7, 0.5,
            boxstyle="round,pad=0.04",
            ec="#2C7A7B", fc="#FFFFFF", lw=1.2
        )
        ax.add_patch(tag)
        ax.text(x + 1.35, y + 0.25, name, ha='center', va='center', 
                fontsize=8.5, fontweight='bold', color='#2C7A7B', fontname='DejaVu Sans')

    draw_collection_tag(6.0, 1.6, "Users Collection")
    draw_collection_tag(9.0, 1.6, "Mood Records Collection")
    draw_collection_tag(12.0, 1.6, "Bookings Collection")
    draw_collection_tag(6.0, 0.9, "Messages Collection")
    draw_collection_tag(9.0, 0.9, "Counsellor Apps. Col.")

    # 5. Draw External Services (Right Column)
    ext_box_w = 4.0
    ext_box_h = 1.3
    draw_uml_box(17.0, 10.1, ext_box_w, ext_box_h, "Jitsi Meet Video API", "Direct audio/video frame\nintegration for therapy", "#F1F5F9", "#4A5568")
    draw_uml_box(17.0, 7.8, ext_box_w, ext_box_h, "Cloudinary API", "Secure image verification &\napplication file storage", "#F1F5F9", "#4A5568")
    draw_uml_box(17.0, 5.5, ext_box_w, ext_box_h, "Email Notification Service", "SMTP automated bookings\nand application status alerts", "#F1F5F9", "#4A5568")

    # 6. DRAW FLOW ARROWS
    def draw_flow_arrow(x1, y1, x2, y2, label="", color="#2D3748", ls="-", label_offset_x=0.0, label_offset_y=0.12, ha='center', va='bottom', connectionstyle=None):
        arrow = patches.FancyArrowPatch(
            (x1, y1), (x2, y2),
            arrowstyle="-|>",
            mutation_scale=14,
            ec=color, fc=color, lw=1.6, ls=ls,
            connectionstyle=connectionstyle
        )
        ax.add_patch(arrow)
        if label:
            ax.text((x1+x2)/2 + label_offset_x, (y1+y2)/2 + label_offset_y, label, 
                    ha=ha, va=va, fontsize=8.5, fontweight='bold', color=color, fontname='DejaVu Sans')

    # Flow 1: Client UI -> Backend REST API Gateway
    draw_flow_arrow(3.2, 8.6, 3.2, 7.6, label="HTTPS / JSON Requests", color="#1A202C", label_offset_x=-0.25, label_offset_y=0.0, ha='right', va='center')

    # Flow 2: REST API Gateway -> Security & Auth / Router
    draw_flow_arrow(4.6, 6.95, 6.0, 6.95, label="Verify")

    # Flow 3: Security & Auth -> Core Business Logic Modules
    draw_flow_arrow(2.8, 6.3, 2.8, 5.8, label="Process", color="#1A202C")
    draw_flow_arrow(7.8, 6.3, 7.8, 5.8, label="Book", color="#1A202C")
    
    # Angled flow from gateway routing to Core Business Logic
    draw_flow_arrow(9.6, 6.55, 11.0, 5.8, label="Route", color="#1A202C", connectionstyle="angle,angleA=0,angleB=-90,rad=3")

    # Flow 4: Backend Services -> MongoDB Database Collections
    draw_flow_arrow(2.8, 4.5, 2.8, 2.9, label="Log Moods", color="#2C7A7B", label_offset_x=-0.12, label_offset_y=0.0, ha='right', va='center')
    draw_flow_arrow(7.8, 4.5, 7.8, 3.0, label="Bookings", color="#2C7A7B", label_offset_x=-0.12, label_offset_y=0.0, ha='right', va='center')
    draw_flow_arrow(12.8, 4.5, 12.8, 3.0, label="Save Chats / Users", color="#2C7A7B", label_offset_x=0.12, label_offset_y=0.0, ha='left', va='center')

    # Flow 5: WebSockets Real-time Communication (Socket.IO <-> Anonymous Peer Chat Interface)
    draw_flow_arrow(12.8, 7.6, 12.8, 10.1, label="Real-time WebSockets", color="#B7791F", ls="-", 
                    label_offset_x=0.15, label_offset_y=0.0, ha='left', va='center')
    draw_flow_arrow(12.8, 10.1, 12.8, 7.6, color="#B7791F", ls="-")

    # Flow 6: External Integrations (Clean horizontal routing)
    # Peer Chat Interface -> Jitsi Video frame
    draw_flow_arrow(15.3, 10.75, 17.0, 10.75, label="Video Call", color="#4A5568")
    
    # Core Backend -> Cloudinary upload
    draw_flow_arrow(14.6, 5.3, 17.0, 8.45, label="Uploads", color="#4A5568", connectionstyle="arc3,rad=-0.05")
    
    # Core Backend -> Email Alerts
    draw_flow_arrow(14.6, 4.9, 17.0, 6.15, label="Email Alerts", color="#4A5568", connectionstyle="arc3,rad=0.05")

    # Save to high quality PNG
    plt.savefig("system_architecture_diagram.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("Successfully generated diagram at system_architecture_diagram.png")

if __name__ == "__main__":
    create_diagram()
