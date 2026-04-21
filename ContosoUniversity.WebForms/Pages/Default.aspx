<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="Default.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.DefaultPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Welcome to Contoso University</h2>
    <p>Contoso University is a sample application that demonstrates how to use
       ASP.NET Web Forms with Entity Framework for a university management system.</p>

    <asp:UpdatePanel ID="StatsPanel" runat="server" UpdateMode="Conditional">
        <ContentTemplate>
            <div class="dashboard-stats">
                <div class="stat-box">
                    <h3>Students</h3>
                    <asp:Label ID="lblStudentCount" runat="server" CssClass="stat-number" />
                </div>
                <div class="stat-box">
                    <h3>Courses</h3>
                    <asp:Label ID="lblCourseCount" runat="server" CssClass="stat-number" />
                </div>
                <div class="stat-box">
                    <h3>Departments</h3>
                    <asp:Label ID="lblDeptCount" runat="server" CssClass="stat-number" />
                </div>
            </div>
            <asp:Timer ID="RefreshTimer" runat="server" Interval="30000" OnTick="RefreshTimer_Tick" />
        </ContentTemplate>
    </asp:UpdatePanel>
</asp:Content>
