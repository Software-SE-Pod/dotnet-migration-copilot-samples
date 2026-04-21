<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="Dashboard.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Admin.DashboardPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Admin Dashboard</h2>

    <asp:UpdatePanel ID="DashPanel" runat="server" UpdateMode="Conditional">
        <ContentTemplate>
            <div class="dashboard-grid">
                <div class="stat-card">
                    <h3>Total Students</h3>
                    <asp:Label ID="lblStudents" runat="server" CssClass="stat-number" />
                </div>
                <div class="stat-card">
                    <h3>Total Courses</h3>
                    <asp:Label ID="lblCourses" runat="server" CssClass="stat-number" />
                </div>
                <div class="stat-card">
                    <h3>Departments</h3>
                    <asp:Label ID="lblDepts" runat="server" CssClass="stat-number" />
                </div>
                <div class="stat-card">
                    <h3>Instructors</h3>
                    <asp:Label ID="lblInstructors" runat="server" CssClass="stat-number" />
                </div>
                <div class="stat-card">
                    <h3>Enrollments</h3>
                    <asp:Label ID="lblEnrollments" runat="server" CssClass="stat-number" />
                </div>
            </div>

            <h3>Recent Enrollments</h3>
            <asp:GridView ID="gvRecent" runat="server"
                AutoGenerateColumns="False" CssClass="data-grid">
                <Columns>
                    <asp:TemplateField HeaderText="Student">
                        <ItemTemplate><%# Eval("Student.FullName") %></ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="Course">
                        <ItemTemplate><%# Eval("Course.Title") %></ItemTemplate>
                    </asp:TemplateField>
                    <asp:BoundField DataField="Grade" HeaderText="Grade" />
                </Columns>
            </asp:GridView>

            <asp:Timer ID="RefreshTimer" runat="server" Interval="60000" OnTick="RefreshTimer_Tick" />
        </ContentTemplate>
    </asp:UpdatePanel>

    <h3>System Info</h3>
    <table class="info-table">
        <tr><td>Session ID</td><td><%= Session.SessionID %></td></tr>
        <tr><td>ViewState Encryption</td><td><%= ViewStateEncryptionMode %></td></tr>
        <tr><td>Server</td><td><%= Environment.MachineName %></td></tr>
        <tr><td>.NET Version</td><td><%= Environment.Version %></td></tr>
    </table>
</asp:Content>
