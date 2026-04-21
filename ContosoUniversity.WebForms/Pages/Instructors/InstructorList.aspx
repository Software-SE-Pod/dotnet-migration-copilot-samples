<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="InstructorList.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Instructors.InstructorListPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Instructors</h2>

    <asp:GridView ID="gvInstructors" runat="server"
        AutoGenerateColumns="False"
        DataKeyNames="InstructorID"
        OnSelectedIndexChanged="gvInstructors_SelectedIndexChanged"
        CssClass="data-grid">
        <Columns>
            <asp:CommandField ShowSelectButton="True" />
            <asp:BoundField DataField="LastName" HeaderText="Last Name" />
            <asp:BoundField DataField="FirstMidName" HeaderText="First Name" />
            <asp:BoundField DataField="HireDate" HeaderText="Hire Date" DataFormatString="{0:d}" />
            <asp:TemplateField HeaderText="Office">
                <ItemTemplate><%# Eval("OfficeAssignment.Location") %></ItemTemplate>
            </asp:TemplateField>
            <asp:TemplateField HeaderText="Courses">
                <ItemTemplate>
                    <asp:Repeater ID="rptCourses" runat="server" DataSource='<%# Eval("Courses") %>'>
                        <ItemTemplate><%# Eval("Title") %><br /></ItemTemplate>
                    </asp:Repeater>
                </ItemTemplate>
            </asp:TemplateField>
            <asp:HyperLinkField Text="Edit"
                DataNavigateUrlFields="InstructorID"
                DataNavigateUrlFormatString="InstructorEdit.aspx?id={0}" />
        </Columns>
    </asp:GridView>

    <asp:Panel ID="pnlDetails" runat="server" Visible="false">
        <h3>Selected Instructor's Students</h3>
        <asp:DetailsView ID="dvStudents" runat="server"
            AutoGenerateRows="False" CssClass="detail-view">
            <Fields>
                <asp:TemplateField HeaderText="Students">
                    <ItemTemplate>
                        <asp:ListView ID="lvStudents" runat="server">
                            <ItemTemplate>
                                <div><%# Eval("Student.FullName") %> — <%# Eval("Grade") %></div>
                            </ItemTemplate>
                        </asp:ListView>
                    </ItemTemplate>
                </asp:TemplateField>
            </Fields>
        </asp:DetailsView>
    </asp:Panel>

    <p><a href="InstructorEdit.aspx">Add New Instructor</a></p>
</asp:Content>
