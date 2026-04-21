<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="EnrollmentStats.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Reports.EnrollmentStatsPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Enrollment Statistics</h2>

    <div class="report-filters">
        <asp:Label runat="server" Text="Department:" AssociatedControlID="ddlDept" />
        <asp:DropDownList ID="ddlDept" runat="server" AutoPostBack="true"
            OnSelectedIndexChanged="ddlDept_SelectedIndexChanged" AppendDataBoundItems="true">
            <asp:ListItem Text="-- All --" Value="" />
        </asp:DropDownList>

        <asp:Label runat="server" Text="Export:" />
        <asp:Button ID="btnExportCsv" runat="server" Text="Export CSV" OnClick="btnExportCsv_Click" />
    </div>

    <h3>Enrollments by Course</h3>
    <asp:Repeater ID="rptEnrollments" runat="server">
        <HeaderTemplate>
            <table class="report-table">
                <thead><tr>
                    <th>Course</th><th>Department</th><th>Enrolled</th><th>Avg Grade</th>
                </tr></thead>
                <tbody>
        </HeaderTemplate>
        <ItemTemplate>
            <tr>
                <td><%# Eval("CourseTitle") %></td>
                <td><%# Eval("DepartmentName") %></td>
                <td><%# Eval("EnrollmentCount") %></td>
                <td><%# Eval("AverageGrade", "{0:F1}") %></td>
            </tr>
        </ItemTemplate>
        <FooterTemplate>
                </tbody>
            </table>
        </FooterTemplate>
    </asp:Repeater>

    <h3>Students per Enrollment Year</h3>
    <asp:DataList ID="dlYearly" runat="server" RepeatDirection="Horizontal" RepeatColumns="5" CssClass="year-grid">
        <ItemTemplate>
            <div class="year-card">
                <div class="year"><%# Eval("Year") %></div>
                <div class="count"><%# Eval("Count") %></div>
            </div>
        </ItemTemplate>
    </asp:DataList>
</asp:Content>
