import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_diagram():
    # Setup high-quality academic figure
    fig, ax = plt.subplots(figsize=(18, 11), dpi=300)
    ax.set_xlim(0, 18)
    ax.set_ylim(0, 11)
    ax.axis('off')
    
    # Clean white background
    fig.patch.set_facecolor('#FFFFFF')
    
    # Title at the top (Academic Style)
    ax.text(9.0, 10.4, "Figure 3.1: System Development Process", ha='center', va='center', 
            fontsize=17, fontweight='bold', color='#1A202C', fontname='DejaVu Sans')
    
    # Subtitle for project context
    ax.text(9.0, 10.0, "MindSpace - Student Mental Health Support System", ha='center', va='center', 
            fontsize=12, style='italic', color='#4A5568', fontname='DejaVu Sans')

    # Helper to draw boundary boxes for phases
    def draw_phase_boundary(x, y, w, h, title, title_color):
        boundary = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.1",
            ec="#94A3B8", fc="#F8FAFC", ls="--", lw=1.2
        )
        ax.add_patch(boundary)
        # Phase Header Text
        ax.text(x + 0.2, y + h - 0.2, title, ha='left', va='center', 
                fontsize=10.5, fontweight='bold', color=title_color, fontname='DejaVu Sans')

    # Helper to draw UML-style process boxes
    def draw_uml_box(x, y, w, h, stage_num, title, subtitle, bg_color, border_color):
        box = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.08",
            ec=border_color, fc=bg_color, lw=1.8
        )
        ax.add_patch(box)
        
        # Stage Number circle/badge background
        badge = patches.Circle((x + 0.3, y + h - 0.3), 0.18, ec=border_color, fc=border_color)
        ax.add_patch(badge)
        # Stage Number text
        ax.text(x + 0.3, y + h - 0.3, str(stage_num), ha='center', va='center', 
                fontsize=8, fontweight='bold', color='#FFFFFF', fontname='DejaVu Sans')
        
        # Draw title text
        ax.text(x + w/2 + 0.15, y + h - 0.3, title, ha='center', va='center', 
                fontsize=10, fontweight='bold', color='#1A202C', fontname='DejaVu Sans')
        # Draw description text
        if subtitle:
            ax.text(x + w/2, y + 0.25, subtitle, ha='center', va='bottom', 
                    fontsize=8.5, color='#4A5568', fontname='DejaVu Sans')

    # 1. Draw Phase Boundaries (Adjusted to avoid any label/box overlapping)
    # Phase 1: Research & Analysis
    draw_phase_boundary(0.5, 7.6, 17.0, 2.0, "Phase 1: Research & Requirements Analysis", "#4A5568")
    
    # Phase 2: System Architecture & Design
    draw_phase_boundary(7.0, 5.1, 10.5, 2.0, "Phase 2: System & Database Design", "#B7791F")
    
    # Phase 3: Implementation, Integration & Testing
    draw_phase_boundary(0.5, 2.2, 17.0, 2.6, "Phase 3: Implementation, Integration & Testing", "#2B6CB0")
    
    # Phase 4: Release & Deployment
    draw_phase_boundary(13.5, 0.1, 4.0, 1.9, "Phase 4: Release", "#319795")

    # 2. Draw Process Boxes
    box_w = 3.0
    box_h = 1.2

    # Row 1 (Phase 1)
    # Stage 1: Requirement Gathering
    draw_uml_box(1.0, 7.9, box_w, box_h, 1, "Requirement Gathering", 
                 "Identify stakeholder needs\n& system specifications", 
                 bg_color="#F1F5F9", border_color="#4A5568")
    # Stage 2: Literature Review
    draw_uml_box(7.5, 7.9, box_w, box_h, 2, "Literature Review", 
                 "Study existing literature\n& psychiatric guidelines", 
                 bg_color="#F1F5F9", border_color="#4A5568")
    # Stage 3: System Analysis
    draw_uml_box(14.0, 7.9, box_w, box_h, 3, "System Analysis", 
                 "Analyze use cases,\nfeasibility & workflows", 
                 bg_color="#F1F5F9", border_color="#4A5568")

    # Row 2 (Phase 2)
    # Stage 4: System Design
    draw_uml_box(14.0, 5.4, box_w, box_h, 4, "System Design", 
                 "Architecture, UI/UX\n& component models", 
                 bg_color="#FEFCBF", border_color="#B7791F")
    # Stage 5: Database Design
    draw_uml_box(7.5, 5.4, box_w, box_h, 5, "Database Design", 
                 "ER diagrams, schemas\n& data security models", 
                 bg_color="#FEFCBF", border_color="#B7791F")

    # Row 3 (Phase 3)
    # Stage 6: Frontend & Backend Development (Y set to 2.9)
    draw_uml_box(1.0, 2.9, box_w, box_h, 6, "Frontend/Backend Dev.", 
                 "React.js & Express coding;\nAI chatbot integration", 
                 bg_color="#EBF8FF", border_color="#2B6CB0")
    # Stage 7: System Integration
    draw_uml_box(7.5, 2.9, box_w, box_h, 7, "System Integration", 
                 "Assemble components;\nconnect APIs & DB", 
                 bg_color="#EBF8FF", border_color="#2B6CB0")
    # Stage 8: Testing and Evaluation
    draw_uml_box(14.0, 2.9, box_w, box_h, 8, "Testing & Evaluation", 
                 "Unit, integration & user\nacceptance evaluation", 
                 bg_color="#EBF8FF", border_color="#2B6CB0")

    # Row 4 (Phase 4)
    # Stage 9: Deployment and Maintenance (Y set to 0.35)
    draw_uml_box(14.0, 0.35, box_w, box_h, 9, "Deployment & Maint.", 
                 "Deploy to cloud, monitor\nusage & perform updates", 
                 bg_color="#E6FFFA", border_color="#319795")

    # Agile Loop Helper Node: Improvements / Refinement
    # Placed in the empty space of Col 2, Row 4 (Y=0.4 to 1.4)
    refinement_box = patches.FancyBboxPatch(
        (7.5, 0.4), box_w, 1.0,
        boxstyle="round,pad=0.06",
        ec="#E53E3E", fc="#FFF5F5", lw=1.5
    )
    ax.add_patch(refinement_box)
    ax.text(7.5 + box_w/2, 1.15, "Agile Improvements", ha='center', va='center', 
            fontsize=9.5, fontweight='bold', color='#C53030', fontname='DejaVu Sans')
    ax.text(7.5 + box_w/2, 0.65, "Refine code, fix bugs\n& optimize UX", ha='center', va='center', 
            fontsize=8.2, color='#9B2C2C', fontname='DejaVu Sans')

    # DRAW FLOW ARROWS
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

    # Midpoints of columns
    col1_mid = 1.0 + box_w/2  # 2.5
    col2_mid = 7.5 + box_w/2  # 9.0
    col3_mid = 14.0 + box_w/2 # 15.5

    # Midpoints of rows (Y)
    r1_mid = 7.9 + box_h/2    # 8.5
    r2_mid = 5.4 + box_h/2    # 6.0
    r3_mid = 2.9 + box_h/2    # 3.5

    # Sequential Arrows:
    # 1 -> 2 (horizontal)
    draw_flow_arrow(1.0 + box_w, r1_mid, 7.5, r1_mid)
    # 2 -> 3 (horizontal)
    draw_flow_arrow(7.5 + box_w, r1_mid, 14.0, r1_mid)
    
    # 3 -> 4 (downwards)
    draw_flow_arrow(col3_mid, 7.9, col3_mid, 6.6)
    
    # 4 -> 5 (horizontal leftwards)
    draw_flow_arrow(14.0, r2_mid, 7.5 + box_w, r2_mid)
    
    # 5 -> 6 (rectilinear down-left)
    # Drawing path: starts at left edge of 5 (7.5, 6.0), goes left to 2.5, then down to top edge of 6 (2.5, 4.1)
    draw_flow_arrow(7.5, r2_mid, col1_mid, 4.1, connectionstyle="angle,angleA=180,angleB=90,rad=3")

    # 6 -> 7 (horizontal)
    draw_flow_arrow(1.0 + box_w, r3_mid, 7.5, r3_mid)
    # 7 -> 8 (horizontal)
    draw_flow_arrow(7.5 + box_w, r3_mid, 14.0, r3_mid)
    
    # 8 -> 9 (downwards)
    draw_flow_arrow(col3_mid, 2.9, col3_mid, 1.55)

    # AGILE ITERATIVE FEEDBACK LOOP ARROWS
    # Arrow A: Testing & Evaluation -> Agile Improvements
    # Curved line going from left of Testing (X=14.0, Y=3.5) down and left to the right side of Improvements (10.5, 0.9)
    draw_flow_arrow(14.0, 3.5, 10.5, 0.9, label="Defects / Refinements", color="#E53E3E", ls="-", 
                    label_offset_x=0.0, label_offset_y=0.15, ha='center', va='bottom',
                    connectionstyle="arc3,rad=0.15")

    # Arrow B: Agile Improvements -> Frontend/Backend Dev
    # Curved line going from left side of Improvements (7.5, 0.9) up and left to right of Dev (X=4.0, Y=3.5)
    draw_flow_arrow(7.5, 0.9, 4.0, 3.5, label="Iteration Loop", color="#E53E3E", ls="-", 
                    label_offset_x=0.0, label_offset_y=0.15, ha='center', va='bottom',
                    connectionstyle="arc3,rad=0.15")

    # Save to high quality PNG
    plt.savefig("system_development_process.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("Successfully generated diagram at system_development_process.png")

if __name__ == "__main__":
    create_diagram()
