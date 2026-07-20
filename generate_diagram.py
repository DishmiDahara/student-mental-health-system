import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_diagram():
    # Setup high-quality academic figure
    # We use a 20x11 coordinate grid to allow spacious gaps and prevent any text overlapping
    fig, ax = plt.subplots(figsize=(20, 11), dpi=300)
    ax.set_xlim(0, 20)
    ax.set_ylim(0, 11)
    ax.axis('off')
    
    # Clean white background
    fig.patch.set_facecolor('#FFFFFF')
    
    # Title at the top (Academic Style)
    ax.text(10.0, 10.3, "Figure 2.1: Existing System Architecture", ha='center', va='center', 
            fontsize=17, fontweight='bold', color='#1A202C', fontname='DejaVu Sans')
    
    # University Counseling Service boundary (Logical Container)
    # Covering Columns 2, 3, and 4
    boundary = patches.FancyBboxPatch(
        (5.0, 0.15), 14.2, 8.8,
        boxstyle="round,pad=0.1",
        ec="#718096", fc="#F8FAFC", ls="--", lw=1.5
    )
    ax.add_patch(boundary)
    
    # Container Label
    ax.text(12.1, 8.7, "University Counseling Service (System Boundary)", ha='center', va='center', 
            fontsize=12, fontweight='bold', color='#4A5568', fontname='DejaVu Sans',
            bbox=dict(facecolor='#FFFFFF', edgecolor='#CBD5E0', boxstyle='round,pad=0.3', lw=1))
    
    # Helper to draw UML-style boxes
    def draw_uml_box(x, y, w, h, title, subtitle, bg_color, border_color):
        box = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.08",
            ec=border_color, fc=bg_color, lw=1.8
        )
        ax.add_patch(box)
        
        # Draw title text
        ax.text(x + w/2, y + h - 0.25, title, ha='center', va='top', 
                fontsize=10.5, fontweight='bold', color='#1A202C', fontname='DejaVu Sans')
        # Draw description text
        if subtitle:
            ax.text(x + w/2, y + 0.2, subtitle, ha='center', va='bottom', 
                    fontsize=9, color='#4A5568', fontname='DejaVu Sans')

    # Helper to draw warning/limitation boxes
    def draw_limitation_box(x, y, w, h, text):
        box = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.06",
            ec="#E53E3E", fc="#FFF5F5", lw=1.2, ls="--"
        )
        ax.add_patch(box)
        
        # Red Header
        ax.text(x + w/2, y + h - 0.2, "⚠️ LIMITATION", ha='center', va='top', 
                fontsize=8.5, fontweight='bold', color='#C53030', fontname='DejaVu Sans')
        # Bullet points
        ax.text(x + w/2, y + 0.15, text, ha='center', va='bottom', 
                fontsize=8.2, color='#9B2C2C', fontname='DejaVu Sans', fontweight='medium')

    # Box dimensions
    box_w = 2.6
    box_h = 1.4

    # ROW 1 (TOP) - Y = 6.8
    # 1. Student (Col 1)
    draw_uml_box(1.0, 6.8, box_w, box_h, "Student", 
                 "Needs mental health support\nand counseling assistance", 
                 bg_color="#EDF2F7", border_color="#4A5568")

    # 2. Manual Appointment Request (Col 2)
    draw_uml_box(6.0, 6.8, box_w, box_h, "Manual Appointment Request", 
                 "Email, Phone Call, or\nIn-person Walk-in request", 
                 bg_color="#FFFDF5", border_color="#D69E2E")

    # 3. Counselor Office (Col 3)
    draw_uml_box(11.0, 6.8, box_w, box_h, "Counselor Office", 
                 "Receives request and\ninitiates intake process", 
                 bg_color="#EBF8FF", border_color="#2B6CB0")

    # 4. Counsellor Availability Checking (Col 4)
    draw_uml_box(16.0, 6.8, box_w, box_h, "Counsellor Availability Checking", 
                 "Manual review of physical\ndiaries & schedule books", 
                 bg_color="#EBF8FF", border_color="#2B6CB0")

    # ROW 2 (BOTTOM) - Y = 2.0
    # 5. Manual Scheduling Process (Col 4)
    draw_uml_box(16.0, 2.0, box_w, box_h, "Manual Scheduling Process", 
                 "Coordinate slots, book time;\nsend confirmation manually", 
                 bg_color="#EBF8FF", border_color="#2B6CB0")

    # 6. Counselling Session (Col 3)
    draw_uml_box(11.0, 2.0, box_w, box_h, "Counselling Session", 
                 "Face-to-face in-person\nsession with counselor", 
                 bg_color="#EBF8FF", border_color="#2B6CB0")

    # 7. Physical Records / Paper Documentation (Col 2)
    draw_uml_box(6.0, 2.0, box_w, box_h, "Physical Records / Paper Doc.", 
                 "Manual record keeping,\npaper files & folder filing", 
                 bg_color="#EBF8FF", border_color="#2B6CB0")

    # 8. Delayed Feedback and Follow-up (Col 1)
    draw_uml_box(1.0, 2.0, box_w, box_h, "Delayed Feedback & Follow-up", 
                 "No automated follow-ups;\nslow, delayed manual checks", 
                 bg_color="#EDF2F7", border_color="#4A5568")

    # LIMITATION TAGS (Placed in gaps between columns vertically centered)
    # Limitation 1: Student / Access (Placed in Gap 1 middle)
    draw_limitation_box(3.75, 4.2, 2.1, 1.8, "• Limited accessibility\n• No real-time support")

    # Limitation 2: Privacy (Placed in Gap 2 middle)
    draw_limitation_box(8.75, 4.2, 2.1, 1.8, "• Lack of privacy during\n  walk-in/phone requests\n• Open access to papers")

    # Limitation 3: Time & Scheduling (Placed in Gap 3 middle)
    draw_limitation_box(13.75, 4.2, 2.1, 1.8, "• Delayed responses\n• Manual schedule conflicts\n• High scheduling effort")

    # Limitation 4: Manual Record Management (Placed below Physical Records)
    draw_limitation_box(6.0, 0.35, 2.6, 1.3, "• Manual record management\n• Risk of physical damage/loss\n• Inefficient retrieval system")

    # DRAW FLOW ARROWS
    def draw_flow_arrow(x1, y1, x2, y2, label="", color="#2D3748", ls="-", label_offset_x=0.0, label_offset_y=0.12, ha='center', va='bottom'):
        arrow = patches.FancyArrowPatch(
            (x1, y1), (x2, y2),
            arrowstyle="-|>",
            mutation_scale=14,
            ec=color, fc=color, lw=1.6, ls=ls
        )
        ax.add_patch(arrow)
        if label:
            ax.text((x1+x2)/2 + label_offset_x, (y1+y2)/2 + label_offset_y, label, 
                    ha=ha, va=va, fontsize=8.5, fontweight='bold', color='#1A202C', fontname='DejaVu Sans')

    # Midpoints of columns
    col1_mid = 1.0 + box_w/2  # 2.3
    col2_mid = 6.0 + box_w/2  # 7.3
    col3_mid = 11.0 + box_w/2 # 12.3
    col4_mid = 16.0 + box_w/2 # 17.3

    # Y midpoints
    r1_mid = 6.8 + box_h/2    # 7.5
    r2_mid = 2.0 + box_h/2    # 2.7

    # Flow 1: Student -> Manual Request (horizontal)
    draw_flow_arrow(1.0 + box_w, r1_mid, 6.0, r1_mid, label="1. Request")

    # Flow 2: Manual Request -> Counselor Office (horizontal)
    draw_flow_arrow(6.0 + box_w, r1_mid, 11.0, r1_mid, label="2. Intake")

    # Flow 3: Counselor Office -> Availability Checking (horizontal)
    draw_flow_arrow(11.0 + box_w, r1_mid, 16.0, r1_mid, label="3. Verifies")

    # Flow 4: Availability Checking -> Manual Scheduling Process (Downwards, perfectly centered)
    draw_flow_arrow(col4_mid, 6.8, col4_mid, 3.4, label="4. Schedules", label_offset_x=0.15, label_offset_y=0.0, ha='left', va='center')

    # Flow 5: Manual Scheduling Process -> Counselling Session (Leftwards)
    draw_flow_arrow(16.0, r2_mid, 11.0 + box_w, r2_mid, label="5. Books")

    # Flow 6: Counselling Session -> Physical Records (Leftwards)
    draw_flow_arrow(11.0, r2_mid, 6.0 + box_w, r2_mid, label="6. Records")

    # Flow 7: Physical Records -> Delayed Feedback and Follow-up (Leftwards)
    draw_flow_arrow(6.0, r2_mid, 1.0 + box_w, r2_mid, label="7. Triggers")

    # Flow 8: Delayed Feedback and Follow-up -> Student (Upwards, perfectly centered, showing follow-up loop)
    draw_flow_arrow(col1_mid, 3.4, col1_mid, 6.8, label="8. Follow-up Loop", color="#718096", ls="--", label_offset_x=-0.15, label_offset_y=0.0, ha='right', va='center')

    # Save to high quality PNG
    plt.savefig("existing_system_architecture.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("Successfully generated diagram at existing_system_architecture.png")

if __name__ == "__main__":
    create_diagram()
